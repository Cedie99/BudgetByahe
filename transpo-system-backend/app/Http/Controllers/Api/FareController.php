<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JeepneyFare;
use App\Models\TricycleFare;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator; // <-- Import the Validator


class FareController extends Controller
{
    /**
     * Fetch fare data for LTFRB.
     */
    public function getLtfrbFares()
    {
        $data = JeepneyFare::all();
        $uploadedAt = JeepneyFare::orderBy('updated_at', 'desc')->value('updated_at');

        return response()->json([
            'data' => $data,
            'uploadedAt' => $uploadedAt ? $uploadedAt->toIso8601String() : null
        ]);
    }

    /**
     * Fetch a list of all distinct LGU places.
     */
    public function getLguPlaces()
    {
        $places = TricycleFare::query()
            ->select('place')
            ->distinct()
            ->orderBy('place')
            ->pluck('place');
            
        return response()->json($places);
    }

    /**
     * Fetch fare data for a specific LGU place.
     */
    public function getLguFareData($place)
    {
        $data = TricycleFare::where('place', $place)->get();
        $uploadedAt = TricycleFare::where('place', $place)
                        ->orderBy('updated_at', 'desc')
                        ->value('updated_at');

        return response()->json([
            'data' => $data,
            'uploadedAt' => $uploadedAt ? $uploadedAt->toIso8601String() : null
        ]);
    }

    /**
     * Upload and replace fare data for a specific category.
     *
     * === THIS FUNCTION IS UPDATED ===
     */
    public function uploadFares(Request $request)
    {
        // **FIX: The data is nested under a 'fares' key**
        // The React app sends: { terminal: {...}, fares: {...} }
        $farePayload = $request->input('fares');

        if (!$farePayload) {
            return response()->json(['error' => "The 'fares' key is missing from the request payload."], 422);
        }

        // **FIX: Validate the nested 'fares' data**
        $validated = validator($farePayload, [
            'category' => 'required|string|in:LTFRB,LGU',
            'data' => 'required|array',
            'place' => 'required_if:category,LGU|nullable|string|max:255'
        ])->validate();


        // **FIX: Get data from the validated $farePayload array**
        $category = $validated['category'];
        $data = $validated['data'];
        $place = $validated['place'] ?? null; 

        // Note: The $request->input('terminal') data is being
        // ignored by this function. You will need a different
        // controller (e.g., TerminalController) to save that.

        try {
            DB::transaction(function () use ($category, $data, $place) {
                if ($category === 'LTFRB') {
                    // This logic remains the same: wipe and replace all.
                    JeepneyFare::query()->delete();
                    
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
                    // **FIXED LGU LOGIC**

                    // 1. Clear old data *only for this place*
                    TricycleFare::query()->where('place', $place)->delete();
                    
                    // 2. Insert new data
                    $insertData = [];
                    foreach ($data as $row) {
                        // Check for PDF-parsed data (which you seem to have)
                        if (isset($row['pdf_text'])) {
                            // You aren't parsing the PDF text on the backend,
                            // but if you were, the logic would go here.
                            // For now, let's assume the frontend might
                            // send CSV-like data *from* a PDF.
                            continue; // Skipping 'pdf_text' parent object
                        }

                        // --- CSV / Standard Array Logic ---
                        $keys = array_keys($row);
                        
                        // Try to find location key
                        $locationKey = 'Location';
                        if (!isset($row[$locationKey]) && isset($keys[0])) {
                            $locationKey = $keys[0]; // Guess 1st column
                        }

                        // Try to find fare key
                        $fareKey = 'Fare';
                        if (!isset($row[$fareKey]) && isset($keys[1])) {
                            $fareKey = $keys[1]; // Guess 2nd column
                        }

                        if ($locationKey && $fareKey && isset($row[$locationKey]) && isset($row[$locationKey])) {
                            $fareValue = $row[$fareKey];
                            
                            // Skip empty/header rows
                            if (empty($row[$locationKey])) continue;

                            $insertData[] = [
                                'place' => $place, // **ADD PLACE**
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
            });

            return response()->json(['message' => 'Data uploaded successfully for ' . ($place ?? $category)], 201);

        } catch (\Exception $e) {
            Log::error('Fare upload failed: ' . $e->getMessage());
            return response()->json(['error' => 'Fare upload failed. ' . $e->getMessage()], 500);
        }
    }

    public function bulkStoreJeepneyFares(Request $request)
    {
        // 1. Validate the incoming data
        $validator = Validator::make($request->all(), [
            'data' => 'required|array',
            'data.*.distance_km' => 'required|numeric',
            'data.*.regular_fare' => 'required|numeric',
            'data.*.discounted_fare' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        
        // --- START: NEW FIX ---
        // We must manually add timestamps for a bulk 'insert()'
        
        $dataToInsert = $validatedData['data'];
        $now = now(); // Get a single timestamp for all rows

        // Loop through the data (by reference '&') and add timestamps
        foreach ($dataToInsert as &$row) {
            $row['created_at'] = $now;
            $row['updated_at'] = $now;
        }
        // --- END: NEW FIX ---

        // 2. Use a database transaction
        DB::beginTransaction();
        try {
            // 3. Empty the existing jeepney fares table
            
            // --- THIS IS THE FIX ---
            // Replaced truncate() with delete() to avoid foreign key constraint errors
            JeepneyFare::query()->delete();
            
            // 4. Insert the new data (use the modified array)
            JeepneyFare::insert($dataToInsert);

            // 5. Commit the changes
            DB::commit();
            
            return response()->json([
                'message' => 'Jeepney fares updated successfully!'
            ], 201);

        } catch (\Exception $e) {
            // 6. Roll back if anything went wrong
            DB::rollBack();
            Log::error('Jeepney bulk upload failed: ' . $e->getMessage()); // Added logging
            return response()->json([
                'message' => 'An error occurred during the bulk upload.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}