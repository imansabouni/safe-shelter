<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
       /*User::firstOrCreate([
    'email' => 'user@test.com'
      ],[
    'name' => 'Test User',
    'password' => bcrypt('password')
     ]);

        User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => Hash::make('admin123'),
        ]);
    */
    }
}
