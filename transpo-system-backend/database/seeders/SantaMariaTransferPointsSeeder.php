<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SantaMariaTransferPointsSeeder extends Seeder
{
    /**
     * Seed Santa Maria, Bulacan transfer points
     * Transfer points are locations where passengers can switch between different routes
     *
     * @return void
     */
    public function run()
    {
        // Clear existing transfer points
        DB::table('transfer_points')->truncate();

        // Santa Maria, Bulacan Transfer Points with GPS coordinates
        $transferPoints = [
            [
                'name' => 'Santa Maria Public Market',
                'barangay' => 'Poblacion',
                'municipality' => 'Santa Maria',
                'latitude' => 14.8199,
                'longitude' => 120.9569,
                'type' => 'point',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Santa Maria Church',
                'barangay' => 'Poblacion',
                'municipality' => 'Santa Maria',
                'latitude' => 14.8234,
                'longitude' => 120.9578,
                'type' => 'point',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Poblacion Junction',
                'barangay' => 'Poblacion',
                'municipality' => 'Santa Maria',
                'latitude' => 14.8234,
                'longitude' => 120.9567,
                'type' => 'point',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'PUP Santa Maria',
                'barangay' => 'Balasing',
                'municipality' => 'Santa Maria',
                'latitude' => 14.8301,
                'longitude' => 120.9689,
                'type' => 'point',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Silangan Junction',
                'barangay' => 'Silangan',
                'municipality' => 'Santa Maria',
                'latitude' => 14.8389,
                'longitude' => 120.9645,
                'type' => 'point',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Bagbaguin Hub',
                'barangay' => 'Bagbaguin',
                'municipality' => 'Santa Maria',
                'latitude' => 14.8512,
                'longitude' => 120.9734,
                'type' => 'point',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Caypombo Junction',
                'barangay' => 'Caypombo',
                'municipality' => 'Santa Maria',
                'latitude' => 14.8456,
                'longitude' => 120.9823,
                'type' => 'point',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Pulong Buhangin',
                'barangay' => 'Pulong Buhangin',
                'municipality' => 'Santa Maria',
                'latitude' => 14.8356,
                'longitude' => 120.9712,
                'type' => 'point',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insert transfer points
        DB::table('transfer_points')->insert($transferPoints);

        $this->command->info('Successfully seeded ' . count($transferPoints) . ' transfer points in Santa Maria, Bulacan!');
    }
}
