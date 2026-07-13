<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Card;
use App\Models\CardMember;
use App\Models\QrLog;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use App\Models\ShelterEntry;
use Illuminate\Support\Str;

class CardController extends Controller
{

/**
 * AİLE OLUŞTUR
 */
public function store(Request $request)
{
    $request->validate([
    'is_family' => 'required|boolean',
    'shelter_id' => [
        'nullable',
        'exists:shelters,id',
        function ($attribute, $value, $fail) use ($request) {
            if ($request->is_family == 1 && $value != null) {
                $fail('Family cards cannot have a shelter assigned.');
            }
        }
    ]
]);
$request->validate([

'family_name' => 'required|string|max:255',
'contact_phone' => 'required|string|max:255',

'has_pet' => 'required|boolean',
'pet_type' => 'nullable|string|max:255',
'pet_inside' => 'required|boolean',

'notes' => 'nullable|string',

'members' => 'required|array|min:1',

'members.*.name' => 'required|string|max:255',
'members.*.age' => 'required|integer|min:0',
'members.*.gender' => 'required|string',

'members.*.role' => 'nullable|string',

'members.*.health_status' => 'nullable|string',

'members.*.has_phone' => 'required|boolean'

]);

return DB::transaction(function () use ($request) {

$memberCount = count($request->members);

$balance = $memberCount * 50;

$card = Card::create([
    'user_id' => 1,
    'user_code' => Str::upper(Str::random(6)),
    'family_code' => 'FAM'.uniqid(),
    'family_name' => $request->family_name,
    'contact_phone' => $request->contact_phone,
    'has_pet' => $request->has_pet,
    'pet_type' => $request->pet_type,
    'pet_inside' => $request->pet_inside,
    'balance' => $balance,
    'notes' => $request->notes,
]);

$members=[];

foreach($request->members as $member){

$members[] = CardMember::create([

'card_id'=>$card->id,
'user_code' => Str::upper(Str::random(6)),
'name'=>$member['name'],
'age'=>$member['age'],
'gender'=>$member['gender'],

'role'=>$member['role'] ?? 'member',

'health_status'=>$member['health_status'] ?? null,

'has_phone'=>$member['has_phone'],

'status'=>'outside',

'last_location'=>null

]);

}

return response()->json([

"success"=>true,

"message"=>"Aile oluşturuldu",
"user_code"=>$card->user_code,

"card"=>$card->load('members'),

"members"=>$members

],201);

});
}

/**
 * KART DETAY
 */

public function show($id)
{

$card = Card::with('members')->find($id);

if(!$card){

return response()->json([
    'success'=>false,
    'message'=>'Kart bulunamadı'
],404);

}

return response()->json([

'success'=>true,
'card'=>$card

]);

}

/**
 * AİLE ÜYESİ EKLE
 */
public function addMember(Request $request, $card_id)
{

$card = Card::find($card_id);

if(!$card){
return response()->json([
'success'=>false,
'message'=>'Kart bulunamadı'
],404);
}

$request->validate([
    'name'=>'required|string',
    'age'=>'required|integer',
    'gender'=>'required|string',
    'has_phone'=>'required|boolean',
    'health_status'=>'nullable|string'
]);

return DB::transaction(function() use($request,$card){

$member = CardMember::create([

'card_id'=>$card->id,
'user_code' => Str::upper(Str::random(6)),
'name'=>$request->name,
'age'=>$request->age,
'gender'=>$request->gender,
'role'=>'member',
'health_status'=>$request->health_status,
'has_phone'=>$request->has_phone,
'status'=>'outside'

]);

// 🔴 Eğer aile sığınaktaysa yeni üyeyi de içeri al
$activeEntry = ShelterEntry::whereIn('card_member_id',
    CardMember::where('card_id',$card->id)->pluck('id')
)
->whereNull('exited_at')
->first();

if($activeEntry){

ShelterEntry::create([
'shelter_id'=>$activeEntry->shelter_id,
'card_member_id'=>$member->id,
'entered_at'=>now()
]);

}

$card->increment('balance',50);

return response()->json([
'success'=>true,
'member'=>$member,
'new_balance'=>$card->balance
]);

});

}

/**
 * ÜYE SİL
 */

public function deleteMember($card_id,$member_id)
{

$member = CardMember::where('card_id',$card_id)
->where('id',$member_id)
->first();

if(!$member){
return response()->json([
'success'=>false,
'message'=>'Üye bulunamadı'
],404);
}

DB::transaction(function () use ($member) {

    // 🔴 Eğer sığınaktaysa çıkış yap
    ShelterEntry::where('card_member_id',$member->id)
    ->whereNull('exited_at')
    ->update([
        'exited_at'=>now()
    ]);

    // sonra üyeyi sil
    $member->delete();

});

return response()->json([
'success'=>true,
'message'=>'Üye silindi ve kapasite güncellendi'
]);

}
protected static function booted()
{
static::deleting(function ($member) {

ShelterEntry::where('card_member_id',$member->id)
->whereNull('exited_at')
->update([
'exited_at'=>now()
]);

});
}

/**
 * TÜM KARTLAR
 */

public function index()
{
return Card::with(['members.shelter','shelter'])->get();
}

/**
 * QR TARAMA (Public Route Köprüsü)
 */
public function scanQr(Request $request)
{
    $qrCode = $request->input('qr_code');

    if(!$qrCode) {
        return response()->json(['success' => false, 'message' => 'QR kod eksik'], 400);
    }

    $qr = DB::table('qr_logs')->where('note', $qrCode)->first();

    if(!$qr){
        return response()->json(['success' => false, 'message' => 'Geçersiz QR kodu'], 404);
    }

    $shelterController = new ShelterController();

    if($qr->type === 'entry'){
        return $shelterController->enter($request);
    } else {
        return $shelterController->exit($request);
    }
}

/**
 * ARKADAŞ EKLE
 */
public function addFriend(Request $request)
{
    try {
        $request->validate([
            'my_code' => 'required',
            'friend_code' => 'required'
        ]);

        // kendini ekleme kontrolü
        if ($request->my_code === $request->friend_code) {
            return response()->json([
                'success' => false,
                'message' => 'Kendini ekleyemezsin'
            ], 400);
        }

        // zaten ekli mi?
        $exists = DB::table('connections')
            ->where('user_code', $request->my_code)
            ->where('friend_code', $request->friend_code)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Zaten arkadaş'
            ], 400);
        }

        DB::table('connections')->insert([
            'user_code' => $request->my_code,
            'friend_code' => $request->friend_code,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Arkadaş eklendi'
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * ARKADAŞLARI GETİR
 */
public function getFriends($code)
{
    $connections = DB::table('connections')
        ->where('user_code', $code)
        ->pluck('friend_code');

    $friends = [];

    foreach ($connections as $friendCode) {
        $member = CardMember::where('user_code', $friendCode)->first();
        $card = Card::where('user_code', $friendCode)->first();

        if ($member) {
            $friends[] = [
                'id' => $member->id,
                'name' => $member->name,
                'status' => $member->status,
                'user_code' => $member->user_code,
                'lat' => $member->latitude,
                'lng' => $member->longitude,
            ];
        } elseif ($card) {
            $friends[] = [
                'id' => $card->id,
                'name' => $card->family_name,
                'status' => 'outside',
                'user_code' => $card->user_code,
                'lat' => $card->latitude,
                'lng' => $card->longitude,
            ];
        }
    }

    return response()->json([
        'success' => true,
        'friends' => $friends
    ]);
}

/**
 * KONUM GÜNCELLE
 */
public function updateLocation(Request $request)
{
    $request->validate([
        'user_code' => 'required',
        'lat' => 'required|numeric',
        'lng' => 'required|numeric'
    ]);

    $member = CardMember::where('user_code', $request->user_code)->first();

    if ($member) {
        $member->latitude = $request->lat;
        $member->longitude = $request->lng;
        $member->save();

        return response()->json(['success' => true, 'type' => 'member']);
    }

    $card = Card::where('user_code', $request->user_code)->first();

    if ($card) {
        $card->latitude = $request->lat;
        $card->longitude = $request->lng;
        $card->save();

        return response()->json(['success' => true, 'type' => 'card']);
    }

    return response()->json([
        'success' => false,
        'message' => 'Kullanıcı bulunamadı'
    ], 404);
}

/**
 * ARKADAŞ / KULLANICI ARA (user_code ile)
 */
public function searchUser($code)
{
    // Önce üyelere (member) bak
    $member = CardMember::where('user_code', $code)->first();

    if ($member) {
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $member->id,
                'name' => $member->name,
                'status' => $member->status,
                'lat' => $member->latitude ?? null,
                'lng' => $member->longitude ?? null,
                'user_code' => $member->user_code
            ]
        ]);
    }

    // Sonra kart sahiplerine (birey/aile reisi) bak
    $card = Card::where('user_code', $code)->first();

    if ($card) {
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $card->id,
                'family_name' => $card->family_name,
                'status' => 'outside',
                'user_code' => $card->user_code
            ]
        ]);
    }

    return response()->json([
        'success' => false,
        'message' => 'Kullanıcı bulunamadı'
    ], 404);
}

    /**
     * SAĞLIK DURUMU GÜNCELLE
     */
    public function updateHealthStatus(Request $request)
    {
        $request->validate([
            'card_member_id' => 'required|exists:card_members,id',
            'health_status' => 'required|string'
        ]);

        $member = CardMember::find($request->card_member_id);
        $member->health_status = $request->health_status;
        $member->save();

        return response()->json([
            'success' => true,
            'message' => 'Sağlık durumu güncellendi',
            'health_status' => $member->health_status
        ]);
    }

}