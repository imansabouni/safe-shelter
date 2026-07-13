<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Shelter;

class ShelterEntrySeeder extends Seeder
{
    public function run()
    {
        Shelter::whereIn('id',[1,2,3,4])->update([
            'capacity_current' => 100
        ]);
    }
}