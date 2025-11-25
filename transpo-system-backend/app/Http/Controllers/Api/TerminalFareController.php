<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Terminal;
use App\Models\JeepneyFare;
use App\Models\TricycleFare;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class TerminalFareController extends Controller
{
    /**
     * Store a new terminal and its associated fares.
     */
    public function store(Request $request)
    {
        // 1. Validate the entire payload from FareUpload.js
        $validator = Validator::make($request->all(), [
            'terminal' => 'required|array',
            'terminal.name' => 'required|string|max:255',
            'terminal.association_name' => 'required|string|max:255',
            'terminal.barangay' => 'required|string|max:255',
            'terminal.municipality' => 'required|string|max:255',
            'terminal.latitude' => 'required|numeric',
            'terminal.longitude' => 'required|numeric',
            'terminal.transport_type_id' => 'required|integer|in:1,2',

            'fares' => 'required|array',
            'fares.category' => 'required|string|in:LTFRB,LGU',
            'fares.place' => 'required_if:fares.category,LGU|nullable|string|max:255',
            'fares.data' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 2. Get the validated data
        $terminalData = $validator->validated()['terminal'];
        $fareData = $validator->validated()['fares'];

        try {
            // 3. Use a transaction
            $terminal = null;
            DB::transaction(function () use ($terminalData, $fareData, &$terminal) {
                
                // --- Step A: Create the Terminal ---
                // This uses the Terminal model you just provided
                $terminal = Terminal::create($terminalData);

                // --- Step B: Save the Fares ---
                $this->saveFares($fareData);
            });

            // 4. Return success
            return response()->json([
                'message' => 'Success! Terminal "' . $terminal->name . '" and its fares have been created.',
                'terminal' => $terminal
            ], 201);

        } catch (\Exception $e) {
            Log::error('Combined submission error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to create terminal and fares. ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Private helper function to process and save fare data.
     */
    private function saveFares(array $fareData)
    {
        $category = $fareData['category'];
        $data = $fareData['data'];
        $place = $fareData['place'] ?? null;

        if ($category === 'LTFRB') {
            JeepneyFare::query()->delete(); // Wipe and replace all
            
            $insertData = array_map(function ($row) {
                return [
                    'distance_km' => $row['Distance (kms.)'] ?? $row['distance_km'] ?? 0,
                    'regular_fare' => $row['Regular'] ?? $row['regular_fare'] ?? 0.00,
                    'discounted_fare' => $row['Student / Elderly / Disabled'] ?? $row['discounted_fare'] ?? 0.00,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }, $data);
            
            JeepneyFare::insert($insertData);

        } elseif ($category === 'LGU') {
            if (!$place) {
                throw new \Exception("A 'place' is required for LGU fares.");
            }
            
            // Clear old data *only for this place*
            TricycleFare::query()->where('place', $place)->delete();
            
            $insertData = [];
            foreach ($data as $row) {
                // Skip the PDF text blob if it exists
                if (isset($row['pdf_text'])) continue;

                $keys = array_keys($row);
                $locationKey = 'Location';
                if (!isset($row[$locationKey]) && isset($keys[0])) $locationKey = $keys[0];

                $fareKey = 'Fare';
                if (!isset($row[$fareKey]) && isset($keys[1])) $fareKey = $keys[1];

                if (isset($row[$locationKey]) && isset($row[$fareKey]) && !empty($row[$locationKey])) {
                    // Clean fare value (removes currency, commas, etc.)
                    $fareValue = preg_replace('/[^0-9.]/', '', $row[$fareKey]); 
                    $insertData[] = [
                        'place' => $place,
                        'location' => $row[$locationKey],
                        'fare' => is_numeric($fareValue) ? (float)$fareValue : 0.00,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
            
            if (!empty($insertData)) {
                TricycleFare::insert($insertData);
            }
        }
    }
}