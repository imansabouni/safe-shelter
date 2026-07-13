<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seeder'lar SADECE 1 KEZ çağrılır
        $this->call([
            UsersSeeder::class,
            ShelterSeeder::class,          // ✅ SADECE BURADA
            ShelterAreaSeeder::class,
            SecondaryShelterSeeder::class,
        ]);
    }
}
