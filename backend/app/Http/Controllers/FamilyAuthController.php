<?php

namespace App\Http\Controllers;

use App\Models\AppUser;
use App\Models\Card;
use App\Models\CardMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class FamilyAuthController extends Controller
{
    public function registerFamilyOwner(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:app_users,email',
            'phone' => 'required|string|max:20',
            'is_family' => 'required|boolean',
            'has_pet' => 'required|boolean',
        ], [
            'email.required' => 'Email adresi zorunludur.',
            'email.email' => 'Geçerli bir email adresi girin.',
            'email.unique' => 'Bu email zaten kayıtlı.',
        ]);

        $email = strtolower(trim($request->email));

        return DB::transaction(function () use ($request, $email) {
            do {
                $familyCode = 'FAM' . strtoupper(Str::random(4));
            } while (Card::where('family_code', $familyCode)->exists());

            do {
                $cardUserCode = strtoupper(Str::random(6));
            } while (Card::where('user_code', $cardUserCode)->exists());

            do {
                $memberUserCode = strtoupper(Str::random(6));
            } while (CardMember::where('user_code', $memberUserCode)->exists());

            $appUser = AppUser::create([
                'name' => $request->name,
                'email' => $email,
                'password' => bcrypt(Str::random(12)),
            ]);

            $nameParts = explode(' ', trim($request->name));
            $lastName = count($nameParts) > 1 ? end($nameParts) : $request->name;
            $familyName = $request->is_family ? ucfirst($lastName) . ' Ailesi' : $request->name;

            $card = Card::create([
                'user_id' => $appUser->id,
                'user_code' => $cardUserCode,
                'is_family' => $request->is_family,
                'family_name' => $familyName,
                'family_code' => $request->is_family ? $familyCode : 'IND' . strtoupper(Str::random(4)),
                'contact_phone' => $request->phone,
                'has_pet' => $request->has_pet,
                'pet_type' => null,
                'pet_inside' => 0,
                'balance' => 0,
                'notes' => $request->is_family ? 'Aile yöneticisi hesabı' : 'Tek birey hesabı',
                'latitude' => null,
                'longitude' => null,
            ]);

            $ownerMember = CardMember::create([
                'card_id' => $card->id,
                'user_code' => $memberUserCode,
                'name' => $request->name,
                'phone' => $request->phone,
                'age' => null,
                'gender' => null,
                'role' => 'owner',
                'health_status' => null,
                'has_phone' => 1,
                'status' => 'outside',
                'last_location' => null,
                'latitude' => null,
                'longitude' => null,
            ]);

            Mail::raw("Giriş / Aile Kodunuz: {$card->family_code}", function ($message) use ($email) {
                $message->to($email)
                    ->subject('Sisteme Giriş Kodunuz');
            });

            return response()->json([
                'success' => true,
                'message' => 'Ana kayıt başarılı. Kod email adresine gönderildi.',
                'app_user' => $appUser,
                'card' => $card,
                'owner_member' => $ownerMember,
                'family_code' => $card->family_code,
            ], 201);
        });
    }

    public function verifyEmailCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:7',
        ], [
            'email.required' => 'Email adresi zorunludur.',
            'email.email' => 'Geçerli bir email adresi girin.',
            'code.required' => 'Kod zorunludur.',
            'code.size' => 'Kod 7 karakter olmalıdır.',
        ]);

        $email = strtolower(trim($request->email));
        $code = strtoupper(trim($request->code));

        $appUser = AppUser::where('email', $email)->first();

        if (!$appUser) {
            return response()->json([
                'success' => false,
                'message' => 'Bu email ile kayıtlı kullanıcı bulunamadı.'
            ], 404);
        }

        $card = Card::where('user_id', $appUser->id)->first();

        if (!$card || $card->family_code !== $code) {
            return response()->json([
                'success' => false,
                'message' => 'Kod hatalı.'
            ], 400);
        }

        $appUser->email_verified_at = now();
        $appUser->save();

        return response()->json([
            'success' => true,
            'message' => 'Email başarıyla doğrulandı.',
        ]);
    }

   public function resendEmailCode(Request $request)
{
    $request->validate([
        'email' => 'required|email',
    ], [
        'email.required' => 'Email adresi zorunludur.',
        'email.email' => 'Geçerli bir email adresi girin.',
    ]);

    $email = strtolower(trim($request->email));

    $appUser = AppUser::where('email', $email)->first();

    if (!$appUser) {
        return response()->json([
            'success' => false,
            'message' => 'Bu email ile kayıtlı kullanıcı bulunamadı.'
        ], 404);
    }

    if ($appUser->email_verified_at) {
        return response()->json([
            'success' => false,
            'message' => 'Bu email zaten doğrulanmış.'
        ], 400);
    }

    $card = Card::where('user_id', $appUser->id)->first();

    if (!$card) {
        return response()->json(['success' => false, 'message' => 'Kullanıcıya ait kart bulunamadı.'], 404);
    }

    Mail::raw("Giriş / Aile Kodunuz: {$card->family_code}", function ($message) use ($email) {
        $message->to($email)
            ->subject('Sisteme Giriş Kodunuz');
    });

    return response()->json([
        'success' => true,
        'message' => 'Kod email adresine yeniden gönderildi.',
        'debug_code' => $card->family_code,
    ]);
}
    public function joinFamily(Request $request)
    {
        $request->validate([
            'family_code' => 'required|string',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
        ]);

        $familyCode = strtoupper(trim($request->family_code));

        $card = Card::where('family_code', $familyCode)->first();

        if (!$card) {
            return response()->json([
                'success' => false,
                'message' => 'Geçersiz aile kodu.'
            ], 404);
        }

        do {
            $memberUserCode = strtoupper(Str::random(6));
        } while (CardMember::where('user_code', $memberUserCode)->exists());

        $member = CardMember::create([
            'card_id' => $card->id,
            'user_code' => $memberUserCode,
            'name' => $request->name,
            'age' => null,
            'gender' => null,
            'role' => 'member',
            'health_status' => null,
            'has_phone' => !empty($request->phone),
            'status' => 'outside',
            'last_location' => null,
            'latitude' => null,
            'longitude' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Aileye katılım başarılı.',
            'member' => $member,
            'family_code' => $card->family_code,
            'card_id' => $card->id,
        ], 201);
    }

    public function loginFamilyMember(Request $request)
    {
        $request->validate([
            'family_code' => 'required|string',
            'name' => 'required|string',
        ]);

        $familyCode = strtoupper(trim($request->family_code));

        $card = Card::where('family_code', $familyCode)->first();

        if (!$card) {
            return response()->json([
                'success' => false,
                'message' => 'Aile bulunamadı.'
            ], 404);
        }

        $member = CardMember::where('card_id', $card->id)
            ->where('name', $request->name)
            ->first();

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'Bu isimde üye bulunamadı.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Giriş başarılı.',
            'member' => $member,
            'card' => $card,
        ]);
    }

    public function loginFamilyOwner(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'Email adresi zorunludur.',
            'email.email' => 'Geçerli bir email adresi girin.',
        ]);

        $email = strtolower(trim($request->email));

        $appUser = AppUser::where('email', $email)->first();

        if (!$appUser) {
            return response()->json([
                'success' => false,
                'message' => 'Kullanıcı bulunamadı.'
            ], 404);
        }

        if (!$appUser->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Lütfen önce email adresinizi doğrulayın.'
            ], 403);
        }

        $card = Card::where('user_id', $appUser->id)->first();

        if (!$card) {
            return response()->json([
                'success' => false,
                'message' => 'Bu kullanıcıya ait aile kartı bulunamadı.'
            ], 404);
        }

        $ownerMember = CardMember::where('card_id', $card->id)
            ->where('role', 'owner')
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'Giriş başarılı.',
            'app_user' => $appUser,
            'card' => $card,
            'owner_member' => $ownerMember,
        ]);
    }
}