<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SecondaryShelter;
use App\Models\Shelter;

class SecondaryShelterSeeder extends Seeder
{
    public function run(): void
    {
        $kucukcekmece = Shelter::where('name', 'Küçükçekmece Merkez Sığınak')->firstOrFail();
        $buyukcekmece = Shelter::where('name', 'Büyükçekmece Merkez Sığınak')->firstOrFail();
        $sultanciftligi = Shelter::where('name', 'Sultançiftliği Merkez Sığınak')->firstOrFail();
        $esenyurt = Shelter::where('name', 'Esenyurt Merkez Sığınağı')->firstOrFail();
        SecondaryShelter::insert([

            /* ==============================
               KÜÇÜKÇEKMECE → MAIN (5)
            ============================== */

            [
                'name' => 'Kanarya Sahil Toplanma Alanı',
                'district' => 'Küçükçekmece',
                'address' => 'Kanarya',
                'lat' => 40.9845,  
                'lng' => 28.7935,
                'status' => 'active',
                'main_shelter_id' => $kucukcekmece->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Halkalı Merkez Okul Bahçesi',
                'district' => 'Küçükçekmece',
                'address' => 'Halkalı Merkez',
                'lat' => 41.0422,
                'lng' => 28.7850,
                'status' => 'active',
                'main_shelter_id' => $kucukcekmece->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Atakent Park Alanı',
                'district' => 'Küçükçekmece',
                'address' => 'Atakent',
                'lat' => 41.0601,
                'lng' => 28.7823,
                'status' => 'active',
                'main_shelter_id' => $kucukcekmece->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Sefaköy Meydanı',
                'district' => 'Küçükçekmece',
                'address' => 'Sefaköy',
                'lat' => 40.9928,
                'lng' => 28.7952,
                'status' => 'active',
                'main_shelter_id' => $kucukcekmece->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Cennet Parkı',
                'district' => 'Küçükçekmece',
                'address' => 'Cennet',
                'lat' => 40.9901,
                'lng' => 28.8120,
                'status' => 'active',
                'main_shelter_id' => $kucukcekmece->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            /* ==============================
               BÜYÜKÇEKMECE → MAIN (5)
            ============================== */

            [
                'name' => 'Mimaroba Sahil Alanı',
                'district' => 'Büyükçekmece',
                'address' => 'Mimaroba',
                'lat' => 40.9742,
                'lng' => 28.6251,
                'status' => 'active',
                'main_shelter_id' => $buyukcekmece->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Sinanoba Spor Alanı',
                'district' => 'Büyükçekmece',
                'address' => 'Sinanoba',
                'lat' => 40.9711,
                'lng' => 28.6403,
                'status' => 'active',
                'main_shelter_id' => $buyukcekmece->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Atatürk Meydanı',
                'district' => 'Büyükçekmece',
                'address' => 'Atatürk',
                'lat' => 40.9805,
                'lng' => 28.6504,
                'status' => 'active',
                'main_shelter_id' => $buyukcekmece->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Cumhuriyet Parkı',
                'district' => 'Büyükçekmece',
                'address' => 'Cumhuriyet',
                'lat' => 40.9789,
                'lng' => 28.6601,
                'status' => 'active',
                'main_shelter_id' => $buyukcekmece->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kamiloba Sahil Alanı',
                'district' => 'Büyükçekmece',
                'address' => 'Kamiloba',
                'lat' => 40.9601,
                'lng' => 28.6104,
                'status' => 'active',
                'main_shelter_id' => $buyukcekmece->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            /* ==============================
               SULTANÇİFTLİĞİ → MAIN (5)
            ============================== */

            [
                'name' => 'Sultançiftliği Merkez Parkı',
                'district' => 'Gaziosmanpaşa',
                'address' => 'Sultançiftliği',
                'lat' => 41.0855,
                'lng' => 28.9102,
                'status' => 'active',
                'main_shelter_id' => $sultanciftligi->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Karadeniz Park Alanı',
                'district' => 'Gaziosmanpaşa',
                'address' => 'Karadeniz',
                'lat' => 41.0822,
                'lng' => 28.9021,
                'status' => 'active',
                'main_shelter_id' => $sultanciftligi->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kazım Karabekir Okul Bahçesi',
                'district' => 'Gaziosmanpaşa',
                'address' => 'Kazım Karabekir',
                'lat' => 41.0901,
                'lng' => 28.9154,
                'status' => 'active',
                'main_shelter_id' => $sultanciftligi->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Mevlana Meydanı',
                'district' => 'Gaziosmanpaşa',
                'address' => 'Mevlana',
                'lat' => 41.0884,
                'lng' => 28.9180,
                'status' => 'active',
                'main_shelter_id' => $sultanciftligi->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Yıldıztabya Park Alanı',
                'district' => 'Gaziosmanpaşa',
                'address' => 'Yıldıztabya',
                'lat' => 41.0789,
                'lng' => 28.9053,
                'status' => 'active',
                'main_shelter_id' => $sultanciftligi->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            /* ==============================
                 ESENYURT → MAIN (5)
             ============================== */
           [
           'name' => 'Esenyurt Cumhuriyet Meydanı',
           'district' => 'Esenyurt',
           'address' => 'Cumhuriyet',
           'lat' => 41.0312,
           'lng' => 28.6765,
           'status' => 'active',
           'main_shelter_id' => $esenyurt->id,
           'created_at' => now(),
           'updated_at' => now(),
        ],
        [
        'name' => 'Mehterçeşme Park Alanı',
        'district' => 'Esenyurt',
        'address' => 'Mehterçeşme',
        'lat' => 41.0348,
        'lng' => 28.6719,
        'status' => 'active',
        'main_shelter_id' => $esenyurt->id,
        'created_at' => now(),
        'updated_at' => now(),
        ],
        [
        'name' => 'Saadetdere Açık Alan',
        'district' => 'Esenyurt',
        'address' => 'Saadetdere',
        'lat' => 41.0214,
        'lng' => 28.6921,
        'status' => 'active',
        'main_shelter_id' => $esenyurt->id,
        'created_at' => now(),
        'updated_at' => now(),
        ],
        [
        'name' => 'İncirtepe Spor Sahası',
        'district' => 'Esenyurt',
        'address' => 'İncirtepe',
        'lat' => 41.0269,
        'lng' => 28.6843,
        'status' => 'active',
        'main_shelter_id' => $esenyurt->id,
        'created_at' => now(),
        'updated_at' => now(),
        ],
        [
        'name' => 'Pınar Mahallesi Parkı',
        'district' => 'Esenyurt',
        'address' => 'Pınar',
        'lat' => 41.0391,
        'lng' => 28.6698,
        'status' => 'active',
        'main_shelter_id' => $esenyurt->id,
        'created_at' => now(),
        'updated_at' => now(),
         ],

        ]);
    }
}
