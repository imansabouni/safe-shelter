<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // GET notifications
    public function index()
    {
        return response()->json(Notification::latest()->get());
    }

    // POST notification
    public function store(Request $request)
    {
        $notification = Notification::create([
            'type' => $request->type,
            'title' => $request->title,
            'message' => $request->message,
            'region' => $request->region,
            'target' => $request->target,
            'status' => 'sent'
        ]);

        return response()->json($notification);
    }
}