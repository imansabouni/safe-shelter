<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Shelter;
use App\Models\ShelterArea;

class ShelterAreaSeeder extends Seeder
{
    public function run(): void
    {
        // نجيب كل الملاجئ من الجدول
        $shelters = Shelter::all();

        foreach ($shelters as $shelter) {

            // مناطق مشتركة لكل الملاجئ
            $commonAreas = [
                [
                    'name' => 'Main Hall',
                    'type' => 'hall',
                    'capacity_total' => 150,
                ],
                [
                    'name' => 'Family Sleeping Area',
                    'type' => 'family',
                    'capacity_total' => 120,
                ],
                [
                    'name' => 'Children Area',
                    'type' => 'children',
                    'capacity_total' => 60,
                ],
                [
                    'name' => 'Pets Area',
                    'type' => 'pets',
                    'capacity_total' => 20,
                ],
                [
                    'name' => 'Medical Corner',
                    'type' => 'medical',
                    'capacity_total' => 10,
                ],
                [
                    'name' => 'Storage Room',
                    'type' => 'storage',
                    'capacity_total' => 40,
                ],
                [
                    'name' => 'Prayer Area',
                    'type' => 'prayer',
                    'capacity_total' => 80,
                ],
            ];

            foreach ($commonAreas as $area) {
                ShelterArea::create([
                    'shelter_id'       => $shelter->id,
                    'name'             => $area['name'],
                    'type'             => $area['type'],
                    'capacity_total'   => $area['capacity_total'],
                    'capacity_current' => 0,
                    'is_active'        => true,
                ]);
            }
 }
}
}