<?php

namespace App\Http\Controllers;

use App\Models\TransportRequest;
use Illuminate\Http\Request;

class TransportRequestController extends Controller
{
    // Mobile: إنشاء طلب نقل

public function store(Request $request)
{
    $data = $request->validate([
        'help_request_id' => 'required|exists:help_requests,id',
        'lat' => 'required|numeric',
        'lng' => 'required|numeric',
        'condition' => 'required|string',
        'companions_count' => 'nullable|integer|min:0',
    ]);

    // جلب طلب المساعدة
    $helpRequest = \App\Models\HelpRequest::find($data['help_request_id']);

    // التحقق المنطقي
    if (!in_array($helpRequest->type, ['injured', 'trapped', 'needs_transport'])) {
        return response()->json([
            'success' => false,
            'message' => 'Bu yardım talebi için taşıma hizmeti gerekli değil.'
        ], 422);
    }

    // إنشاء طلب النقل
    $transport = TransportRequest::create([
        'help_request_id' => $helpRequest->id,
        'lat' => $data['lat'],
        'lng' => $data['lng'],
        'condition' => $data['condition'],
        'companions_count' => $data['companions_count'] ?? 0,
        'status' => 'new',
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Taşıma talebi oluşturuldu',
        'data' => $transport
    ], 201);
}


    // Web: عرض جميع الطلبات
    public function index()
    {
        return response()->json(
            TransportRequest::with(['user', 'shelter'])->latest()->get()
        );
    }

    // Web: تحديث حالة الطلب
    public function update(Request $request, $id)
    {
        $req = TransportRequest::findOrFail($id);

        $request->validate([
            'status' => 'required|in:new,accepted,on_the_way,completed',
        ]);

        $req->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Status updated',
            'data' => $req
        ]);
    }
}
