<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Comment;

class CommentController extends Controller
{
    /**
     * ✍️ Yorum ekle
     */
    public function store(Request $req)
    {
        $req->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
            'shelter_id' => 'required|exists:shelters,id',
            'card_id' => 'nullable|exists:cards,id',
            'card_member_id' => 'nullable|exists:card_members,id',
            'name' => 'nullable|string|max:255'
        ]);

        if ($req->card_id && $req->card_member_id) {
            return response()->json([
                'success' => false,
                'message' => 'Sadece biri kullanılabilir'
            ], 400);
        }

        $comment = Comment::create([
            'card_id' => $req->card_id,
            'card_member_id' => $req->card_member_id,
            'shelter_id' => $req->shelter_id,
            'name' => $req->name,
            'rating' => $req->rating,
            'comment' => $req->comment,
            'status' => 'approved' // direkt yayın 🔥
        ]);

        return response()->json([
            'success' => true,
            'data' => $comment->load(['card','member'])
        ]);
    }

    /**
     * 📊 Tüm yorumlar (UI için)
     */
    public function index()
    {
        $comments = Comment::with(['card','member'])
            ->where('status','approved')
            ->latest()
            ->get();

        return response()->json([
            'data' => $comments,
            'stats' => [
                'average' => round($comments->avg('rating'),1),
                'count' => $comments->count(),
                'response_rate' => 98.5 // fake stat 😄
            ]
        ]);
    }
}