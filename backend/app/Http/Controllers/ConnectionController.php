<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Connection;
use App\Models\Card;
use App\Models\CardMember;

class ConnectionController extends Controller
{
    // Arkadaş ekleme
    public function addFriend(Request $request)
{
    $request->validate([
        'friend_code' => 'required|string',
    ]);

    $myCode = strtoupper(trim($request->my_code ?? $request->user_code ?? ''));
    $friendCode = strtoupper(trim($request->friend_code));

    if (!$myCode) {
        return response()->json([
            'success' => false,
            'message' => 'my_code veya user_code gerekli'
        ], 422);
    }

    if ($myCode === $friendCode) {
        return response()->json([
            'success' => false,
            'message' => 'Kendini arkadaş olarak ekleyemezsin'
        ], 400);
    }

    $friendExists =
        \App\Models\CardMember::whereRaw('UPPER(user_code) = ?', [$friendCode])->exists() ||
        \App\Models\Card::whereRaw('UPPER(user_code) = ?', [$friendCode])->exists();

    if (!$friendExists) {
        return response()->json([
            'success' => false,
            'message' => 'Bu koda sahip kullanıcı bulunamadı'
        ], 404);
    }

    $exists = \App\Models\Connection::whereRaw('UPPER(user_code) = ?', [$myCode])
        ->whereRaw('UPPER(friend_code) = ?', [$friendCode])
        ->exists();

    if ($exists) {
        return response()->json([
            'success' => false,
            'message' => 'Bu arkadaş zaten ekli'
        ]);
    }

    \App\Models\Connection::create([
        'user_code' => $myCode,
        'friend_code' => $friendCode
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Arkadaş eklendi'
    ]);
}

    // Arkadaşları listele
    public function getFriends($code)
    {
        $code = strtoupper(trim($code));

        $connections = Connection::where('user_code', $code)->get();

        $friends = $connections->map(function ($connection) {
            $member = CardMember::where('user_code', $connection->friend_code)->first();

            if ($member) {
                return [
                    'id' => 'member_' . $member->id,
                    'name' => $member->name,
                    'user_code' => $member->user_code,
                    'status' => $member->status ?? 'outside',
                    'lat' => $member->latitude ?? null,
                    'lng' => $member->longitude ?? null,
                    'location' => $member->last_location ?? null,
                    'type' => 'member',
                ];
            }

            $card = Card::where('user_code', $connection->friend_code)->first();

            if ($card) {
                return [
                    'id' => 'card_' . $card->id,
                    'name' => $card->family_name ?? $card->name ?? 'İsimsiz',
                    'user_code' => $card->user_code,
                    'status' => $card->status ?? 'outside',
                    'lat' => $card->latitude ?? null,
                    'lng' => $card->longitude ?? null,
                    'location' => $card->last_location ?? null,
                    'type' => $card->is_family ? 'family' : 'card',
                ];
            }

            return null;
        })->filter()->values();

        return response()->json([
            'success' => true,
            'friends' => $friends
        ]);
    }
}