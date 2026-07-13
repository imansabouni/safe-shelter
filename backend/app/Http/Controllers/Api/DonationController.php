<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Donation;
use App\Models\Resource;

class DonationController extends Controller
{
    /**
     * 📌 BAĞIŞ YAP
     */
    public function store(Request $req)
    {
        $req->validate([
            'type' => 'required|in:money,resource',
            'amount' => 'nullable|numeric',
            'resource_type' => 'nullable|string',
            'quantity' => 'nullable|integer',
            'shelter_id' => 'nullable|exists:shelters,id',
            'card_id' => 'nullable|exists:cards,id',
            'card_member_id' => 'nullable|exists:card_members,id',
            'note' => 'nullable|string|max:1000'
        ]);

        // 🔒 aynı anda ikisi dolu olamaz
        if ($req->card_id && $req->card_member_id) {
            return response()->json([
                'success' => false,
                'message' => 'Sadece card_id veya card_member_id kullanılabilir'
            ], 400);
        }

        $donation = Donation::create([
            'type' => $req->type,
            'amount' => $req->amount,
            'resource_type' => $req->resource_type,
            'quantity' => $req->quantity,
            'shelter_id' => $req->shelter_id,
            'card_id' => $req->card_id,
            'card_member_id' => $req->card_member_id,
            'note' => $req->note,
            'is_anonymous' => true,
            'payment_status' => 'success'
        ]);

        /**
         * 📦 Kaynak bağışıysa stok artır
         */
        if ($req->type === 'resource') {

            $resource = Resource::where('shelter_id', $req->shelter_id)
                ->where('type', $req->resource_type)
                ->first();

            if (!$resource) {
                $resource = Resource::create([
                    'shelter_id' => $req->shelter_id,
                    'type' => $req->resource_type,
                    'current' => 0,
                    'min' => 0
                ]);
            }

            $resource->increment('current', $req->quantity ?? 0);
        }

        return response()->json([
            'success' => true,
            'message' => 'Bağış başarılı ❤️',
            'data' => $donation->load(['card','member']) // 🔥 isim için
        ]);
    }

    /**
     * 📊 TÜM BAĞIŞLAR
     */
    public function index()
    {
        $donations = Donation::with(['card','member'])
            ->latest()
            ->get();

        return response()->json([
            'data' => $donations,
            'system_note' => 'Bağışlar düzenli olarak ilgili yerlere ulaştırılmaktadır ❤️'
        ]);
    }

    /**
     * 🔍 TEK BAĞIŞ
     */
    public function show($id)
    {
        $donation = Donation::with(['card','member'])->find($id);

        if (!$donation) {
            return response()->json([
                'success' => false,
                'message' => 'Bağış bulunamadı'
            ], 404);
        }

        return response()->json([
            'data' => $donation
        ]);
    }

    /**
     * ❌ BAĞIŞ SİL (opsiyonel)
     */
    public function destroy($id)
    {
        $donation = Donation::find($id);

        if (!$donation) {
            return response()->json([
                'success' => false,
                'message' => 'Bağış bulunamadı'
            ], 404);
        }

        $donation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Bağış silindi'
        ]);
    }
}