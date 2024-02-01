<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (User::where('email', 'admin@gmail.com')->count() == 0) {
            $user = User::create([
                'name' => 'Super Admin',
                'email' => 'admin@gmail.com',
                'password' => bcrypt('rahasia'),
                'email_verified_at' => now(),
            ]);
            $user->save();
        }
    }
}
