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

class TerminalController extends Controller
{
    /**
     * Display a listing of the terminals.
     */
    public function index()
    {
        // Your existing logic for fetching all terminals
        $terminals = Terminal::all();
        return response()->json($terminals);
    }

    /**
     * Store a newly created terminal (without fares).
     */
    public function store(Request $request)
    {
        // Your existing logic for storing just a terminal
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'association_name' => 'required|string|max:255',
            'barangay' => 'required|string|max:255',
            'municipality' => 'required|string|max:255',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'transport_type_id' => 'required|integer|in:1,2',
        ]);

        $terminal = Terminal::create($validated);

        return response()->json([
            'message' => "Success! Terminal {$terminal->name} created.",
            'data'    => $terminal
        ], 201);
    }

    /**
     * Store a new terminal AND its associated fares from the upload form.
     *
     * === THIS IS THE NEW FUNCTION YOU NEED ===
     */
    public function storeWithFares(Request $request)
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
                $terminal = Terminal::create($terminalData);

                // --- Step B: Save the Fares (NOW PASSING $terminal) ---
                $this->saveFares($fareData, $terminal); // <-- ADD $terminal HERE
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
            // This is the error message you are seeing
            return response()->json([
                'error' => 'Fare upload failed. ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Private helper function to process and save fare data.
     *
     * === ADD THIS HELPER FUNCTION ===
     */
    private function saveFares(array $fareData, Terminal $terminal)
    {
        $category = $fareData['category'];
        $data = $fareData['data'];
        $place = $fareData['place'] ?? null;

        if ($category === 'LTFRB') {
            // $insertData[] = [
            //    'terminal_id' => $terminal->id, 
            //    'base_fare' => $row['base_fare'], 
            //    ...
            // ];

        } elseif ($category === 'LGU') {
            if (!$place) {
                throw new \Exception("A 'place' is required for LGU fares.");
            }
            
            // --- BUG FIX: REMOVED THIS LINE ---
            // TricycleFare::query()->where('place', $place)->delete();
            // (You are *creating* a new terminal, you shouldn't delete other fares)
            
            $insertData = [];
            foreach ($data as $row) {
                
                if (isset($row['Content'])) {
                    $insertData[] = [
                        'terminal_id' => $terminal->id, // <-- THE FIX
                        'place' => $place,
                        'location' => 'Page ' . ($row['Page'] ?? 'N/A') . ': ' . substr($row['Content'], 0, 250),
                        'fare' => 0.00,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                    continue; 
                }

                // --- ** EXISTING CSV LOGIC ** ---
                // (This will run if 'Content' is not set)

                $keys = array_keys($row);
                $locationKey = 'Location';
                if (!isset($row[$locationKey]) && isset($keys[0])) $locationKey = $keys[0];

                $fareKey = 'Fare';
                if (!isset($row[$fareKey]) && isset($keys[1])) $fareKey = $keys[1];

                if (isset($row[$locationKey]) && isset($row[$fareKey]) && !empty($row[$locationKey])) {
                    // Clean fare value (removes currency, commas, etc.)
                    $fareValue = preg_replace('/[^0-9.]/', '', $row[$fareKey]); 
                    $insertData[] = [
                        'terminal_id' => $terminal->id,
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

   public function destroy($id)
    {
        $terminal = Terminal::find($id); 

        if (!$terminal) {
            return response()->json(['error' => 'Terminal not found'], 404);
        }

        try {
            // --- UPDATED LOGIC ---
            // Delete all associated fares.
            
            // $terminal->jeepneyFares()->delete(); // <-- COMMENT OUT THIS LINE
            $terminal->tricycleFares()->delete();

            // Now, it's safe to delete the terminal itself
            $terminal->delete();
            
            return response()->json(['message' => 'Terminal and all associated fares deleted successfully']);

        } catch (\Exception $e) {
            Log::error('Delete Terminal Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'An error occurred while deleting the terminal.',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function findByAssociation($association_name)
    {
        $terminal = Terminal::where('association_name', $association_name)->first();

        if (!$terminal) {
            return response()->json(['message' => 'Terminal not found'], 404);
        }

        return response()->json($terminal);
    }
}