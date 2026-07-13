<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Invite;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // ==============================
    // REGISTER (INVITE ONLY 🔥)
    // ==============================
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:4',
            'token' => 'required' // 🔥 أهم شي
        ]);

        // 🔥 تحقق من invite
        $invite = Invite::where('token', $validated['token'])
            ->where('used', false)
            ->first();

        if (!$invite) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or used invite'
            ], 400);
        }

        // 🔥 إنشاء المستخدم مع role من invite
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $invite->role, // 🔥 هون السر
        ]);

        // 🔥 تحديث invite
        $invite->used = true;
        $invite->save();

        // 🔐 token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    // ==============================
    // LOGIN
    // ==============================
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($validated)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid login details',
            ], 401);
        }

        $user = Auth::user();

        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User logged in successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    // ==============================
    // LOGOUT
    // ==============================
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'User logged out successfully'
        ]);
    }

    // ==============================
    // ME
    // ==============================
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()
        ]);
    }
}