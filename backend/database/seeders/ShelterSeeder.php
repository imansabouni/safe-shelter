<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Shelter;

class ShelterSeeder extends Seeder
{
   public function run(): void
{
    Shelter::insert([
        [
            'name'=>'Küçükçekmece Merkez Sığınak',
            'district'=>'Küçükçekmece',
            'lat'=>41.0006,
            'lng'=>28.7895,
            'created_at'=>now(),
            'updated_at'=>now()
        ],
        [
            'name'=>'Büyükçekmece Merkez Sığınak',
            'district'=>'Büyükçekmece',
            'lat'=>41.0201,
            'lng'=>28.5850,
            'created_at'=>now(),
            'updated_at'=>now()
        ],
        [
            'name'=>'Sultançiftliği Merkez Sığınak',
            'district'=>'Gaziosmanpaşa',
            'lat'=>41.0784,
            'lng'=>28.9115,
            'created_at'=>now(),
            'updated_at'=>now()
        ],
        [
            'name'=>'Esenyurt Merkez Sığınağı',
            'district'=>'Esenyurt',
            'lat'=>41.0349,
            'lng'=>28.6801,
            'created_at'=>now(),
            'updated_at'=>now()
        ],
    ]);
}
}