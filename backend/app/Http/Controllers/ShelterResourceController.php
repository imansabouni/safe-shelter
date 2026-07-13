<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Resource;
use App\Models\ResourceRequest;
use App\Models\Shelter;

class ShelterResourceController extends Controller
{
  public function index()
{
    $shelters = Shelter::with('resources')->get();

    foreach ($shelters as $shelter) {
        $this->consumeResources($shelter);
    }

    $data = [];

    foreach ($shelters as $shelter) {

        $resources = [];

        foreach ($shelter->resources as $r) {
            $resources[] = [
                'type' => $r->type,
                'current' => (int) $r->current,
                'min' => (int) $r->min,
            ];
        }

        $data[] = [
            'id' => $shelter->id,
            'name' => $shelter->name,
            'status' => $shelter->status,
            'capacity_current' => $shelter->capacity_current,
            'resources' => $resources
        ];
    }

    return response()->json($data);
}

    public function getResources()
    {
        $shelters = Shelter::with('resources')->get();

        foreach ($shelters as $shelter) {
            $this->consumeResources($shelter);
        }

        return response()->json($shelters);
    }

    // 🚚 ADMIN GÖNDER VEYA STAFF TALEP
    public function send(Request $req)
    {
        $req->validate([
            'shelter_id' => 'required|exists:shelters,id',
            'type' => 'required|string',
            'amount' => 'required|integer|min:1',
            'is_request' => 'nullable|boolean'
        ]);

        $status = $req->is_request ? 'requested' : 'on_way';

        $request = ResourceRequest::create([
            'shelter_id' => $req->shelter_id,
            'type' => $req->type,
            'amount' => $req->amount,
            'status' => $status
        ]);

        return response()->json([
            'success' => true,
            'message' => $req->is_request ? 'Talep iletildi' : 'Kaynak gönderildi 🚚',
            'data' => $request
        ]);
    }

    // 🟢 ADMIN ONAYLA
    public function approveRequest($id)
    {
        $req = ResourceRequest::findOrFail($id);
        if ($req->status === 'requested') {
            $req->status = 'on_way';
            $req->created_at = now(); // Reset timer for delivery
            $req->save();
        }
        return response()->json(['success' => true, 'data' => $req]);
    }

    // 📦 STATUS + STOCK
   public function requests()
{
    try {
        $requests = ResourceRequest::latest()->get();

        foreach ($requests as $req) {

            if (!$req->created_at) continue;

            // 🔥 FIX: timestamp ile doğru süre hesabı
            $seconds = now()->timestamp - $req->created_at->timestamp;

            // ⏳ 1 DK → TESLİM
            if ($seconds >= 60 && $req->status === 'on_way') {

                $req->status = 'delivered';

               $resource = Resource::where('shelter_id', $req->shelter_id)
    ->where('type', $req->type)
    ->first();

// ❗ yoksa oluştur
if (!$resource) {
    $resource = Resource::create([
        'shelter_id' => $req->shelter_id,
        'type' => $req->type,
        'current' => 0,
        'min' => 0
    ]);
}

// ✅ sonra ekle
$resource->current += $req->amount;
$resource->save();
            }

            $req->save();
        }

        return response()->json([
            'data' => $requests
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
}
    // 🔥 TÜKETİM (AYNEN)
    private function consumeResources($shelter)
    {
       $people = max((int)$shelter->capacity_current + 100, 1);

        foreach ($shelter->resources as $resource) {

            if ($resource->type === 'blankets') continue;

            $now = now();

            if (!$resource->last_consumed_at) {
                $resource->last_consumed_at = $now;
                $resource->save();
                continue;
            }

            $seconds = $resource->last_consumed_at->diffInSeconds($now);
            if ($seconds <= 0) continue;

            $daily = 0;

            switch ($resource->type) {

                case 'water':
                    $daily = $people * 3;
                    break;

                case 'food':

                    $last = $resource->last_consumed_at;
                    $meals = 0;
                    $checkTime = $last->copy();

                    while ($checkTime < $now) {

                        $lunch = $checkTime->copy()->setTime(12, 0);
                        $dinner = $checkTime->copy()->setTime(18, 0);

                        if ($checkTime < $lunch && $now >= $lunch) $meals++;
                        if ($checkTime < $dinner && $now >= $dinner) $meals++;

                        $checkTime->addDay()->setTime(0, 0);
                    }

                    if ($meals > 0) {
                        $consume = $meals * $people;
                        $resource->current = max(0, $resource->current - $consume);
                        $resource->last_consumed_at = $now;
                        $resource->save();
                    }
                    continue 2;

                case 'fuel':
                    $daily = ($people * 0.3) + 5;
                    break;

                case 'hygiene':
                    $daily = $people * 0.5;
                    break;

                case 'medicine':
                    $daily = ($people * 0.1) + 2;
                    break;
            }

            if ($daily <= 0) continue;

            $hourly = $daily / 24;
            $perSecond = $hourly / 3600;
            $consumed = $perSecond * $seconds;

            $resource->current = max(0, $resource->current - $consumed);
            $resource->last_consumed_at = $now;

            $resource->save();
        }
    }
}