<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShelterResourceSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('resources')->truncate();

        $data = [];

        for ($i = 1; $i <= 4; $i++) {
            $data[] = ['shelter_id' => $i, 'type' => 'water', 'current' => 5000];
            $data[] = ['shelter_id' => $i, 'type' => 'food', 'current' => 4000];
            $data[] = ['shelter_id' => $i, 'type' => 'medicine', 'current' => 2000];
            $data[] = ['shelter_id' => $i, 'type' => 'blankets', 'current' => 4000];
            $data[] = ['shelter_id' => $i, 'type' => 'fuel', 'current' => 3500];
            $data[] = ['shelter_id' => $i, 'type' => 'hygiene', 'current' => 3000];
        }

        DB::table('resources')->insert($data);
    }
}