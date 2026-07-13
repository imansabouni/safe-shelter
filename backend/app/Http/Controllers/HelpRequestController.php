<?php

namespace App\Http\Controllers;

use App\Models\HelpRequest;
use Illuminate\Http\Request;

class HelpRequestController extends Controller
{
    /**
     * TÜM YARDIM TALEPLERİNİ GETİR
     */
    public function index()
    {
        $requests = HelpRequest::orderByRaw("FIELD(priority, 'high', 'medium', 'low')")
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'message' => 'Help requests fetched successfully',
            'data' => $requests
        ], 200);
    }

    /**
     * YARDIM TALEBİ OLUŞTUR
     */
    public function store(Request $request)
    {
        \Log::info('--- CREATE HELP REQUEST ---');
        \Log::info('Request All:', $request->all());
        \Log::info('Raw input:', ['input' => file_get_contents('php://input')]);

        $validated = $request->validate([
    'card_id' => 'nullable|exists:cards,id',
    'card_member_id' => 'nullable|exists:card_members,id',
    'type' => 'required|string|in:injured,trapped,needs_transport,other',
    'note' => 'nullable|string',
    'location' => 'nullable|string',
    'lat' => 'nullable|numeric',   // ✅ EKLE
    'lng' => 'nullable|numeric',   // ✅ EKLE
]);
        // ❗ En az bir kimlik gelmeli
        if (empty($validated['card_id']) && empty($validated['card_member_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'card_id veya card_member_id gerekli'
            ], 422);
        }

        // ❗ Sadece bir kimlik gelmeli
        if (!empty($validated['card_id']) && !empty($validated['card_member_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'Sadece bir kimlik gönder (card_id veya card_member_id)'
            ], 422);
        }

        // TYPE → PRIORITY
        $priority = match ($validated['type']) {
            'injured', 'trapped' => 'high',
            'needs_transport' => 'medium',
            default => 'low'
        };

        // %100 ÇALIŞAN ÇÖZÜM: Raw JSON decode
        $data = json_decode(file_get_contents('php://input'), true);

        // Koordinatları al (Farklı kaynaklardan deniyoruz)
        $lat = $request->input('lat') ?? ($data['lat'] ?? null);
        $lng = $request->input('lng') ?? ($data['lng'] ?? null);

        // Fallback: Eğer koordinatlar yoksa ama location stringi varsa parçala
        if (empty($lat) && empty($lng) && !empty($validated['location'])) {
            $parts = explode(',', $validated['location']);
            if (count($parts) === 2) {
                $lat = trim($parts[0]);
                $lng = trim($parts[1]);
            }
        }

        $helpRequest = HelpRequest::create([
            'card_id'        => $validated['card_id'] ?? null,
            'card_member_id' => $validated['card_member_id'] ?? null,
            'type'           => $validated['type'],
            'note'           => $validated['note'] ?? null,
            'location'       => $validated['location'] ?? null,
            'lat'            => $lat,
            'lng'            => $lng,
            'status'         => 'pending',
            'priority'       => $priority,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Yardım talebi oluşturuldu',
            'data' => $helpRequest
        ], 201);
    }

    /**
     * TEK YARDIM TALEBİ GETİR
     */
    public function show($id)
    {
        $helpRequest = HelpRequest::find($id);

        if (!$helpRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Yardım talebi bulunamadı'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $helpRequest
        ], 200);
    }

    /**
     * DURUM VE PRIORITY GÜNCELLEME
     */
    public function update(Request $request, $id)
    {
        $helpRequest = HelpRequest::find($id);

        if (!$helpRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Yardım talebi bulunamadı'
            ], 404);
        }

        $validated = $request->validate([
            'status'   => 'nullable|string|in:pending,in_progress,resolved',
            'priority' => 'nullable|string|in:low,medium,high',
        ]);

        // STATUS GÜNCELLEME
        if (isset($validated['status'])) {

            $helpRequest->status = $validated['status'];

            if ($validated['status'] === 'in_progress') {
                $helpRequest->started_at = now();
            }

            if ($validated['status'] === 'resolved') {
                $helpRequest->completed_at = now();
            }
        }

        // PRIORITY GÜNCELLEME
        if (isset($validated['priority'])) {
            $helpRequest->priority = $validated['priority'];
        }

        $helpRequest->save();

        return response()->json([
            'success' => true,
            'message' => 'Talep güncellendi',
            'data' => $helpRequest
        ], 200);
    }

    /**
     * DETAILS
     */
    public function details($id)
    {
        $helpRequest = HelpRequest::find($id);

        if (!$helpRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Help request not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'help_request' => [
                'id' => $helpRequest->id,
                'type' => $helpRequest->type,
                'status' => $helpRequest->status,
                'location' => $helpRequest->location,
                'lat' => $helpRequest->lat,
                'lng' => $helpRequest->lng,
            ],
        ], 200);
    }

    /**
     * FİLTRELEME
     */
    public function filter(Request $request)
    {
        $query = HelpRequest::query();

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->type) {
            $query->where('type', $request->type);
        }

        if ($request->card_id) {
            $query->where('card_id', $request->card_id);
        }

        if ($request->card_member_id) {
            $query->where('card_member_id', $request->card_member_id);
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $results = $query->orderByRaw("FIELD(priority, 'high', 'medium', 'low')")
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'count' => $results->count(),
            'data' => $results
        ], 200);
    }
}