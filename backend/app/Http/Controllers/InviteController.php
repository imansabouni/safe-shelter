<?php

namespace App\Http\Controllers;

use App\Models\Invite;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail; // ✅ مهم

class InviteController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'role' => 'required|in:admin,staff'
        ]);

        $token = Str::random(40);

        $invite = Invite::create([
            'email' => $request->email,
            'role' => $request->role,
            'token' => $token,
        ]);

        $link = "http://192.168.1.173:3001/register?token=$token";

        // 💌 إرسال الإيميل
        Mail::raw("You are invited!\n\nRegister here: $link", function ($message) use ($request) {
            $message->to($request->email)
                    ->subject('SafeShelter Invitation');
        });

        return response()->json([
            'message' => 'Invite created',
            'link' => $link
        ]);
    }
}