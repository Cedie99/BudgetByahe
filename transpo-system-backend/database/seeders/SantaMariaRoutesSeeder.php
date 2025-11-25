<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SantaMariaRoutesSeeder extends Seeder
{
    /**
     * Seed Santa Maria, Bulacan jeepney and tricycle routes
     * 
     * This uses the CURRENT table structure
     *
     * @return void
     */
    public function run()
    {
        // Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Delete existing routes
        DB::table('routes')->truncate();
        
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Santa Maria, Bulacan Routes with GPS coordinates
        // GPS coordinates are approximate locations in Santa Maria, Bulacan
        $routes = [
            // Main Jeepney Routes (Transport Type ID 1)
            [
                'route_name' => 'Santa Maria Public Market to Pulong Buhangin',
                'start_terminal_id' => 1,
                'end_terminal_id' => 2,
                'start_latitude' => 14.8199,
                'start_longitude' => 120.9569,
                'end_latitude' => 14.8356,
                'end_longitude' => 120.9712,
                'total_distance_km' => 3.5,
                'transport_type_id' => 1,
                'status' => 'active',
            ],
            [
                'route_name' => 'Santa Maria Church to Caypombo',
                'start_terminal_id' => 1,
                'end_terminal_id' => 2,
                'start_latitude' => 14.8234,
                'start_longitude' => 120.9578,
                'end_latitude' => 14.8456,
                'end_longitude' => 120.9823,
                'total_distance_km' => 4.2,
                'transport_type_id' => 1,
                'status' => 'active',
            ],
            [
                'route_name' => 'Silangan to Parada',
                'start_terminal_id' => 1,
                'end_terminal_id' => 2,
                'start_latitude' => 14.8389,
                'start_longitude' => 120.9645,
                'end_latitude' => 14.8123,
                'end_longitude' => 120.9498,
                'total_distance_km' => 5.8,
                'transport_type_id' => 1,
                'status' => 'active',
            ],
            [
                'route_name' => 'Poblacion to PUP Santa Maria',
                'start_terminal_id' => 1,
                'end_terminal_id' => 2,
                'start_latitude' => 14.8234,
                'start_longitude' => 120.9567,
                'end_latitude' => 14.8301,
                'end_longitude' => 120.9689,
                'total_distance_km' => 2.8,
                'transport_type_id' => 1,
                'status' => 'active',
            ],
            [
                'route_name' => 'Bagbaguin to Santa Maria Market',
                'start_terminal_id' => 1,
                'end_terminal_id' => 2,
                'start_latitude' => 14.8512,
                'start_longitude' => 120.9734,
                'end_latitude' => 14.8199,
                'end_longitude' => 120.9569,
                'total_distance_km' => 6.2,
                'transport_type_id' => 1,
                'status' => 'active',
            ],
            [
                'route_name' => 'Guyong to Municipal Hall',
                'start_terminal_id' => 1,
                'end_terminal_id' => 2,
                'start_latitude' => 14.8089,
                'start_longitude' => 120.9478,
                'end_latitude' => 14.8234,
                'end_longitude' => 120.9578,
                'total_distance_km' => 3.1,
                'transport_type_id' => 1,
                'status' => 'active',
            ],
            [
                'route_name' => 'Balasing to Sta. Maria Terminal',
                'start_terminal_id' => 1,
                'end_terminal_id' => 2,
                'start_latitude' => 14.8423,
                'start_longitude' => 120.9812,
                'end_latitude' => 14.8199,
                'end_longitude' => 120.9569,
                'total_distance_km' => 4.8,
                'transport_type_id' => 1,
                'status' => 'active',
            ],
            
            // Tricycle Routes (Transport Type ID 2) - shorter distances
            [
                'route_name' => 'Manggahan to Balite',
                'start_terminal_id' => 1,
                'end_terminal_id' => 2,
                'start_latitude' => 14.8267,
                'start_longitude' => 120.9623,
                'end_latitude' => 14.8312,
                'end_longitude' => 120.9689,
                'total_distance_km' => 1.5,
                'transport_type_id' => 2,
                'status' => 'active',
            ],
            [
                'route_name' => 'Pulong Buhangin to Camangyanan',
                'start_terminal_id' => 1,
                'end_terminal_id' => 2,
                'start_latitude' => 14.8356,
                'start_longitude' => 120.9712,
                'end_latitude' => 14.8289,
                'end_longitude' => 120.9645,
                'total_distance_km' => 1.8,
                'transport_type_id' => 2,
                'status' => 'active',
            ],
            [
                'route_name' => 'Santa Clara to Poblacion',
                'start_terminal_id' => 1,
                'end_terminal_id' => 2,
                'start_latitude' => 14.8178,
                'start_longitude' => 120.9534,
                'end_latitude' => 14.8234,
                'end_longitude' => 120.9567,
                'total_distance_km' => 1.2,
                'transport_type_id' => 2,
                'status' => 'active',
            ],
            [
                'route_name' => 'Buenavista Terminal to Mahabang Parang',
                'start_terminal_id' => 1,
                'end_terminal_id' => 2,
                'start_latitude' => 14.8145,
                'start_longitude' => 120.9512,
                'end_latitude' => 14.8201,
                'end_longitude' => 120.9589,
                'total_distance_km' => 1.6,
                'transport_type_id' => 2,
                'status' => 'active',
            ],
            [
                'route_name' => 'Caingin to Dulong Bayan',
                'start_terminal_id' => 1,
                'end_terminal_id' => 2,
                'start_latitude' => 14.8398,
                'start_longitude' => 120.9756,
                'end_latitude' => 14.8445,
                'end_longitude' => 120.9823,
                'total_distance_km' => 1.4,
                'transport_type_id' => 2,
                'status' => 'active',
            ],
            [
                'route_name' => 'Parada to San Gabriel',
                'start_terminal_id' => 1,
                'end_terminal_id' => 2,
                'start_latitude' => 14.8123,
                'start_longitude' => 120.9498,
                'end_latitude' => 14.8167,
                'end_longitude' => 120.9545,
                'total_distance_km' => 1.3,
                'transport_type_id' => 2,
                'status' => 'active',
            ],
            [
                'route_name' => 'Municipal Hall to Partida',
                'start_terminal_id' => 1,
                'end_terminal_id' => 2,
                'start_latitude' => 14.8234,
                'start_longitude' => 120.9578,
                'end_latitude' => 14.8278,
                'end_longitude' => 120.9634,
                'total_distance_km' => 1.7,
                'transport_type_id' => 2,
                'status' => 'active',
            ],
            [
                'route_name' => 'Pulong Yantok to Santa Maria Market',
                'start_terminal_id' => 1,
                'end_terminal_id' => 2,
                'start_latitude' => 14.8334,
                'start_longitude' => 120.9678,
                'end_latitude' => 14.8199,
                'end_longitude' => 120.9569,
                'total_distance_km' => 2.1,
                'transport_type_id' => 2,
                'status' => 'active',
            ],
        ];

        // Insert routes with timestamps
        foreach ($routes as $route) {
            $route['created_at'] = now();
            $route['updated_at'] = now();
            DB::table('routes')->insert($route);
        }

        $this->command->info('Successfully seeded ' . count($routes) . ' routes in Santa Maria, Bulacan!');
        $this->command->info('- Jeepney routes: 7');
        $this->command->info('- Tricycle routes: 8');
    }
}
