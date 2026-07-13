<?php

namespace App\Http\Controllers;

use App\Models\Shelter;
use App\Models\SecondaryShelter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\CardMember;
use App\Models\ShelterEntry;
use App\Models\Card;
use App\Models\UnregisteredEntry;

class ShelterController extends Controller
{
    /* =====================================================
       TÜM MAIN SIĞINAKLAR
    ===================================================== */
    public function index()
{
    $shelters = Shelter::with('areas')->get();

    $statusLabels = [
        'open' => 'Açık',
        'closed' => 'Kapalı',
    ];

    return response()->json([
        'success' => true,
        'count' => $shelters->count(),
        'shelters' => $shelters->map(function ($shelter) use ($statusLabels) {

            // 🔹 Kayıtlı içeridekiler (QR ile girenler)
            $registeredCount = DB::table('shelter_entries')
                ->where('shelter_id', $shelter->id)
                ->whereNull('exited_at')
                ->count();

            // 🔹 Kayıtsız manuel girilen kişiler
            $unregisteredCount = UnregisteredEntry::where('shelter_id', $shelter->id)
                ->sum('people_count');

            // 🔹 Gerçek kapasite
            $currentCapacity = $registeredCount + $unregisteredCount;

            return [
                'id' => $shelter->id,
                'name' => $shelter->name,
                'district' => $shelter->district,
                'address' => $shelter->address,
                'lat' => (float) $shelter->lat,
                'lng' => (float) $shelter->lng,

                'status' => [
                    'key' => $shelter->status,
                    'label' => $statusLabels[$shelter->status] ?? 'Bilinmiyor'
                ],

                'capacity' => [
                    'total' => $shelter->capacity_total,
                    'current' => $currentCapacity,
                    'percentage' => $shelter->capacity_total == 0
                        ? "0%"
                        : round(($currentCapacity / $shelter->capacity_total) * 100) . "%"
                ],

                'areas_count' => $shelter->areas->count(),
                'available_areas' => $shelter->areas
                    ->pluck('type')
                    ->unique()
                    ->values(),
            ];
        })
    ], 200, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}

    /* =====================================================
       EN YAKIN AÇIK SIĞINAK (MAIN + SECONDARY)
    ===================================================== */
    public function nearby(Request $request)
    {
        $lat = $request->lat;
        $lng = $request->lng;

        if (!$lat || !$lng) {
            return response()->json([
                'success' => false,
                'message' => 'Konum bilgisi eksik.'
            ], 400);
        }

        // MAIN shelters
        $mainShelters = Shelter::where('status', 'open')
            ->select(
                'id',
                'name',
                'district',
                'address',
                'lat',
                'lng',
                DB::raw("'main' as shelter_type"),
                DB::raw("NULL as parent_id"),
                DB::raw("
                    (6371 * acos(
                        cos(radians($lat)) * cos(radians(lat)) *
                        cos(radians(lng) - radians($lng)) +
                        sin(radians($lat)) * sin(radians(lat))
                    )) as distance
                ")
            );

        // SECONDARY shelters
        $secondaryShelters = SecondaryShelter::where('status', 'open')
            ->select(
                'id',
                'name',
                'district',
                'address',
                'lat',
                'lng',
                DB::raw("'secondary' as shelter_type"),
                'main_shelter_id as parent_id',
                DB::raw("
                    (6371 * acos(
                        cos(radians($lat)) * cos(radians(lat)) *
                        cos(radians(lng) - radians($lng)) +
                        sin(radians($lat)) * sin(radians(lat))
                    )) as distance
                ")
            );

        $nearestShelters = $mainShelters
            ->unionAll($secondaryShelters)
            ->orderBy('distance')
            ->take(5)
            ->get();

        if ($nearestShelters->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Yakında açık sığınak bulunamadı.'
            ], 404);
        }

        $results = $nearestShelters->map(function ($shelter) {
            $parent = null;
            if ($shelter->shelter_type === 'secondary') {
                $parent = Shelter::find($shelter->parent_id);
            }

            return [
                'id' => $shelter->id,
                'name' => $shelter->name,
                'district' => $shelter->district,
                'address' => $shelter->address,
                'lat' => (float) $shelter->lat,
                'lng' => (float) $shelter->lng,
                'type' => $shelter->shelter_type,
                'parent' => $parent ? [
                    'id' => $parent->id,
                    'name' => $parent->name,
                    'lat' => (float) $parent->lat,
                    'lng' => (float) $parent->lng,
                ] : null,
                'distance_km' => round($shelter->distance, 2),
            ];
        });

        return response()->json([
            'success' => true,
            'count' => $results->count(),
            'data' => $results
        ], 200, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }

    /* =====================================================
       MAIN SIĞINAK DETAY
    ===================================================== */
    public function show($id)
{
    $shelter = Shelter::with('areas')->find($id);

    if (!$shelter) {
        return response()->json([
            'success' => false,
            'message' => 'Sığınak bulunamadı.'
        ], 404);
    }

    $statusLabels = [
        'open' => 'Açık',
        'closed' => 'Kapalı',
    ];

    // 🔥 Areas üzerinden toplam kapasite hesaplama
   $totalCapacity = $shelter->capacity_total;
   // QR ile giren kayıtlı kişiler
$registeredCount = DB::table('shelter_entries')
    ->where('shelter_id', $id)
    ->whereNull('exited_at')
    ->count();

// Admin tarafından girilen kayıtsız kişiler
$unregisteredCount = DB::table('unregistered_entries')
    ->where('shelter_id', $id)
    ->sum('people_count');

// Toplam gerçek doluluk
$currentCapacity = $registeredCount + $unregisteredCount;

    return response()->json([
        'success' => true,
        'shelter' => [
            'id' => $shelter->id,
            'name' => $shelter->name,
            'district' => $shelter->district,
            'address' => $shelter->address,

            'lat' => (float) $shelter->lat,
            'lng' => (float) $shelter->lng,

            'status' => [
                'key' => $shelter->status,
                'label' => $statusLabels[$shelter->status] ?? 'Bilinmiyor',
            ],

            // 🔥 Artık gerçek toplam
             'capacity' => [
             'total' => $shelter->capacity_total,
             'current' => $currentCapacity,
             'unregistered' => $unregisteredCount,
             'percentage' => $shelter->capacity_total == 0
            ? "0%"
         : round(($currentCapacity / $shelter->capacity_total) * 100) . "%"
          ],

            'areas_count' => $shelter->areas->count(),

            'areas' => $shelter->areas->map(function ($area) {
                return [
                    'id' => $area->id,
                    'name' => $area->name,
                    'type' => $area->type,
                    'capacity' => [
                        'total' => $area->capacity_total,
                        'current' => $area->capacity_current,
                    ],
                    'is_active' => (bool) $area->is_active,
                ];
            }),
        ]
    ], 200, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
public function enter(Request $request)
{
    if(!$request->card_id && !$request->card_member_id){
        return response()->json([
            'success'=>false,
            'message'=>'card_id veya card_member_id gerekli'
        ],400);
    }

    // 🔥 QR BUL
    $qr = DB::table('qr_logs')
        ->where('note', $request->qr_code)
        ->first();

    if(!$qr){
        return response()->json([
            'success'=>false,
            'message'=>'Geçersiz QR'
        ],404);
    }

    if($qr->type !== 'entry'){
        return response()->json([
            'success'=>false,
            'message'=>'Bu QR giriş için değil'
        ],400);
    }

    // =========================
    // 👨‍👩‍👧 AİLE GİRİŞİ
    // =========================
    if($request->card_id){

        $card = Card::findOrFail($request->card_id);

        // aktif kontrol
        $active = ShelterEntry::where('card_id',$card->id)
            ->whereNull('exited_at')
            ->first();

        if($active){
            return response()->json([
                'success'=>false,
                'message'=>'Bu aile zaten içeride'
            ],400);
        }

        // 🔥 TÜM ÜYELERİ İÇERİ AL
        $members = CardMember::where('card_id',$card->id)->get();

        foreach($members as $member){
            ShelterEntry::create([
                'shelter_id'=>$qr->shelter_id,
                'card_id'=>$card->id,
                'card_member_id'=>$member->id,
                'type' => 'entry', // 🚀 Eklendi
                'entered_at'=>now()
            ]);

            $member->update(['status'=>'inside']);
        }

        $card->update([
            'status'=>'inside',
            'shelter_id'=>$qr->shelter_id
        ]);

        return response()->json([
            'success'=>true,
            'message'=>'Aile giriş yaptı'
        ]);
    }

    // =========================
    // 👤 BİREY VE REFAKATÇİ GİRİŞİ
    // =========================
    if($request->card_member_id){

        $member = CardMember::findOrFail($request->card_member_id);

        // 1. Ana kişinin girişi kontrolü
        $active = ShelterEntry::where('card_member_id', $member->id)
            ->whereNull('exited_at')
            ->first();

        if($active){
            return response()->json([
                'success'=>false,
                'message'=>'Bu kişi zaten içeride'
            ],400);
        }

        ShelterEntry::create([
            'shelter_id'=>$qr->shelter_id,
            'card_member_id'=>$member->id,
            'card_id'=>$member->card_id,
            'type' => 'entry',
            'entered_at'=>now()
        ]);
        $member->update(['status'=>'inside']);

        // 2. Yanındaki refakatçilerin girişi (Telefonu olmayanlar)
        if($request->has('companion_ids') && is_array($request->companion_ids)){
            foreach($request->companion_ids as $cId){
                $companion = CardMember::find($cId);
                if($companion && $companion->card_id == $member->card_id){
                    $cActive = ShelterEntry::where('card_member_id', $companion->id)
                        ->whereNull('exited_at')
                        ->first();
                    
                    if(!$cActive){
                        ShelterEntry::create([
                            'shelter_id'=>$qr->shelter_id,
                            'card_member_id'=>$companion->id,
                            'card_id'=>$companion->card_id,
                            'type' => 'entry',
                            'entered_at'=>now()
                        ]);
                        $companion->update(['status'=>'inside']);
                    }
                }
            }
        }

        return response()->json([
            'success'=>true,
            'message'=>'Giriş işlemi (refakatçilerle birlikte) başarıyla tamamlandı'
        ]);
    }
    if(!$qr){
    return response()->json([
        'success'=>false,
        'message'=>'QR bulunamadı'
    ],404);
}
}
public function exit(Request $request)
{
   $qr = DB::table('qr_logs')
    ->where('note', $request->qr_code)
    ->first();

    if(!$qr){
        return response()->json([
            'success'=>false,
            'message'=>'Geçersiz QR'
        ],404);
    }

    if($qr->type !== 'exit'){
        return response()->json([
            'success'=>false,
            'message'=>'Bu QR çıkış için değil'
        ],400);
    }

    // =========================
    // 👨‍👩‍👧 AİLE ÇIKIŞI
    // =========================
    if($request->card_id){

        $members = CardMember::where('card_id',$request->card_id)->get();

        foreach($members as $member){
            $entry = ShelterEntry::where('card_member_id',$member->id)
                ->whereNull('exited_at')
                ->latest()
                ->first();

            if($entry){
                if($entry->shelter_id !== $qr->shelter_id){
                    return response()->json([
                        'success'=>false,
                        'message'=>'Bu QR kodu, giriş yaptığınız sığınağa ait değil.'
                    ],400);
                }

                ShelterEntry::create([
                    'card_id' => $request->card_id,
                    'card_member_id' => $member->id,
                    'shelter_id' => $entry->shelter_id,
                    'type' => 'exit',
                    'exited_at' => now(),
                ]);

                // Eski kaydı da güncellemeliyiz ki whereNull('exited_at') kontrolüne takılıp kişi sonsuza dek içeride kalmasın.
                $entry->update(['exited_at' => now()]);

                $member->update(['status'=>'outside']);
            }
        }

        Card::where('id',$request->card_id)->update([
            'status'=>'outside',
            'shelter_id'=>null
        ]);

        return response()->json([
            'success'=>true,
            'message'=>'Aile çıkış yaptı'
        ]);
        if(!$qr){
    return response()->json([
        'success'=>false,
        'message'=>'QR bulunamadı'
    ],404);
}
    }

    // =========================
    // 👤 BİREY VE REFAKATÇİ ÇIKIŞI
    // =========================
    if($request->card_member_id){

        $member = CardMember::findOrFail($request->card_member_id);

        // 1. Ana kişinin çıkışı
        $active = ShelterEntry::where('card_member_id', $member->id)
            ->whereNull('exited_at')
            ->latest()
            ->first();

        if(!$active){
            return response()->json([
                'success'=>false,
                'message'=>'Bu kişi zaten dışarıda'
            ],400);
        }

        if($active->shelter_id !== $qr->shelter_id){
            return response()->json([
                'success'=>false,
                'message'=>'Bu QR kodu, giriş yaptığınız sığınağa ait değil.'
            ],400);
        }

        ShelterEntry::create([
            'card_id' => $member->card_id,
            'card_member_id' => $member->id,
            'shelter_id' => $active->shelter_id,
            'type' => 'exit',
            'exited_at' => now(),
        ]);
        
        // Eski kaydı güncelleyerek kişinin içeride kalmasını önlüyoruz.
        $active->update(['exited_at' => now()]);
        
        $member->update(['status'=>'outside']);

        // 2. Refakatçilerin çıkışı
        if($request->has('companion_ids') && is_array($request->companion_ids)){
            foreach($request->companion_ids as $cId){
                $companion = CardMember::find($cId);
                if($companion && $companion->card_id == $member->card_id){
                    $cActive = ShelterEntry::where('card_member_id', $companion->id)
                        ->whereNull('exited_at')
                        ->latest()
                        ->first();
                    if($cActive){
                        ShelterEntry::create([
                            'card_id' => $companion->card_id,
                            'card_member_id' => $companion->id,
                            'shelter_id' => $cActive->shelter_id,
                            'type' => 'exit',
                            'exited_at' => now(),
                        ]);
                        
                        // Refakatçinin eski kaydını da güncelliyoruz.
                        $cActive->update(['exited_at' => now()]);
                        
                        $companion->update(['status'=>'outside']);
                    }
                }
            }
        }

        return response()->json([
            'success'=>true,
            'message'=>'Çıkış işlemi (refakatçilerle birlikte) başarıyla tamamlandı'
        ]);
    }
}

public function transfer(Request $request)
{

$member = CardMember::where('qr_code',$request->qr_code)->firstOrFail();

DB::transaction(function() use ($member,$request){

$activeEntry = ShelterEntry::where('card_member_id',$member->id)
->whereNull('exited_at')
->first();

if($activeEntry){

$activeEntry->update([
'exited_at'=>now()
]);

}

ShelterEntry::create([
'shelter_id'=>$request->shelter_id,
'card_member_id'=>$member->id,
'entered_at'=>now()
]);

});

return response()->json([
'success'=>true,
'message'=>'Sığınak değiştirildi'
]);

}

public function getLogs()
{
    $logs = ShelterEntry::with(['member','shelter'])
        ->latest()
        ->get();

    return response()->json([
        'success' => true,
        'logs' => $logs
    ]);
}
public function update(Request $request, $id)
{
    $shelter = Shelter::findOrFail($id);

    $shelter->status = $request->status;
    $shelter->save();

    return response()->json([
        'success' => true
    ]);
}
    /* =====================================================
       ACİL DURUM TAHLİYE ROTASI (User -> Nearest -> Main)
    ===================================================== */
    public function evacuationPath(Request $request)
    {
        $lat = $request->lat;
        $lng = $request->lng;

        if (!$lat || !$lng) {
            return response()->json([
                'success' => false,
                'message' => 'Konum bilgisi eksik.'
            ], 400);
        }

        // 1. En yakın sığınağı bul (Main veya Secondary)
        $mainShelters = Shelter::where('status', 'open')
            ->select(
                'id', 'name', 'district', 'address', 'lat', 'lng',
                DB::raw("'main' as shelter_type"),
                DB::raw("NULL as parent_id"),
                DB::raw("(6371 * acos(cos(radians($lat)) * cos(radians(lat)) * cos(radians(lng) - radians($lng)) + sin(radians($lat)) * sin(radians(lat)))) as distance")
            );

        $secondaryShelters = SecondaryShelter::where('status', 'open')
            ->select(
                'id', 'name', 'district', 'address', 'lat', 'lng',
                DB::raw("'secondary' as shelter_type"),
                'main_shelter_id as parent_id',
                DB::raw("(6371 * acos(cos(radians($lat)) * cos(radians(lat)) * cos(radians(lng) - radians($lng)) + sin(radians($lat)) * sin(radians(lat)))) as distance")
            );

        $nearest = $mainShelters->unionAll($secondaryShelters)->orderBy('distance')->first();

        if (!$nearest) {
            return response()->json([
                'success' => false,
                'message' => 'Yakında açık sığınak/toplanma alanı bulunamadı.'
            ], 404);
        }

        // Rota adımlarını oluştur
        $path = [];

        // ADIM 1: Kullanıcıdan en yakına
        $step1 = [
            'step_number' => 1,
            'type' => $nearest->shelter_type, // 'main' veya 'secondary'
            'target' => [
                'id' => $nearest->id,
                'name' => $nearest->name,
                'lat' => (float)$nearest->lat,
                'lng' => (float)$nearest->lng,
                'distance_km' => round($nearest->distance, 2)
            ]
        ];
        $path[] = $step1;

        // ADIM 2: Eğer ilki secondary ise -> Main Sığınağa git
        if ($nearest->shelter_type === 'secondary') {
            $parent = Shelter::find($nearest->parent_id);
            if ($parent) {
                // Secondary -> Main arası mesafe
                // Backend'de hesaplayabiliriz veya frontend hesaplar.
                // Basitlik için sadece koordinat dönüyoruz.
                $step2 = [
                    'step_number' => 2,
                    'type' => 'main',
                    'target' => [
                        'id' => $parent->id,
                        'name' => $parent->name,
                        'lat' => (float)$parent->lat,
                        'lng' => (float)$parent->lng,
                    ],
                    'note' => 'İkincil alandan ana sığınağa geçiş rotası'
                ];
                $path[] = $step2;
            }
        }

        return response()->json([
            'success' => true,
            'evacuation_plan' => $path
        ], 200, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }
}
