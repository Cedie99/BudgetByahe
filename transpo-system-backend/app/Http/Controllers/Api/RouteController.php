<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Route;
use App\Models\RoutePoint; // Make sure this path is correct
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class RouteController extends Controller
{
    /**
     * Display a listing of the routes (for the admin list).
     */
    public function index()
    {
        // This is for your admin panel (RouteBuilder.js)
        $routes = Route::select('id', 'route_name', 'total_distance_km')->get();
        return response()->json($routes);
    }

    /**
     * Get just the points for a specific route.
     * This is for your main app (MainFeature.js).
     */
    public function showRoutePoints($id)
    {
        try {
            $route = Route::findOrFail($id);
            
            // Get points, re-map 'latitude' to 'lat' and 'longitude' to 'lng'
            $points = $route->routePoints()
                            ->select('latitude', 'longitude') // Only select what's needed
                            ->orderBy('order_no')
                            ->get()
                            ->map(function ($point) {
                                return [
                                    'lat' => (float)$point->latitude,
                                    'lng' => (float)$point->longitude,
                                ];
                            });

            return response()->json($points);

        } catch (\Exception $e) {
            Log::error("Failed to fetch route points for route $id: " . $e->getMessage());
            return response()->json(['error' => 'Route not found'], 404);
        }
    }

    /**
     * --- NEW ---
     * Get all routes with their points for map display.
     */
    public function getAllRoutePaths()
    {
        try {
            $routes = Route::with(['routePoints' => function ($query) {
                $query->select('route_id', 'latitude', 'longitude')->orderBy('order_no');
            }])
            ->select('id', 'route_name', 'transport_type_id')
            ->get();

            $formattedRoutes = $routes->map(function ($route) {
                // Only return routes that actually have points
                if ($route->routePoints->isEmpty()) {
                    return null;
                }
                
                return [
                    'id' => $route->id,
                    'name' => $route->route_name,
                    'transport_type_id' => $route->transport_type_id,
                    'points' => $route->routePoints->map(function ($point) {
                        return [
                            'lat' => (float)$point->latitude,
                            'lng' => (float)$point->longitude,
                        ];
                    }),
                ];
            })->filter(); // ->filter() removes null entries

            return response()->json($formattedRoutes);

        } catch (\Exception $e) {
            Log::error("Failed to get all route paths: " . $e->getMessage());
            return response()->json(['error' => 'An internal error occurred.'], 500);
        }
    }


    /**
     * Store a new route AND its points.
     * This is for your admin panel (RouteBuilder.js).
     */
    public function storeWithPoints(Request $request)
    {
        // --- MODIFICATION 1: Update Validation Rules ---
        $validator = Validator::make($request->all(), [
            'route_name' => 'required|string|max:255',
            'transport_type_id' => 'required|exists:transport_types,id',
            'total_distance_km' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive',
            
            // Add new coordinate fields
            'start_latitude' => 'required|numeric|min:-90|max:90',
            'start_longitude' => 'required|numeric|min:-180|max:180',
            'end_latitude' => 'required|numeric|min:-90|max:90',
            'end_longitude' => 'required|numeric|min:-180|max:180',

            // Keep points validation
            'points' => 'required|array|min:2',
            'points.*.lat' => 'required|numeric',
            'points.*.lng' => 'required|numeric',
        ]);
        // --- END MODIFICATION 1 ---

        if ($validator->fails()) {
            // This is the 422 error you were seeing
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        try {
            $route = null;
            DB::transaction(function () use ($validatedData, &$route) {
                
                // --- MODIFICATION 2: Update Route::create() call ---
                $route = Route::create([
                    'route_name' => $validatedData['route_name'],
                    'transport_type_id' => $validatedData['transport_type_id'],
                    'total_distance_km' => $validatedData['total_distance_km'],
                    'status' => $validatedData['status'],
                    'start_latitude' => $validatedData['start_latitude'],
                    'start_longitude' => $validatedData['start_longitude'],
                    'end_latitude' => $validatedData['end_latitude'],
                    'end_longitude' => $validatedData['end_longitude'],
                ]);
                // --- END MODIFICATION 2 ---

                // 2. Prepare the points for insertion (This part was correct)
                $pointsData = [];
                $now = now(); 

                foreach ($validatedData['points'] as $index => $point) {
                    $pointsData[] = [
                        'route_id' => $route->id,
                        'latitude' => $point['lat'],
                        'longitude' => $point['lng'],
                        'order_no' => $index + 1,
                        'barangay_name' => null, 
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }

                // 3. Bulk insert the points
                RoutePoint::insert($pointsData);
            });

            return response()->json([
                'message' => 'Route and points saved successfully!',
                'route' => $route 
            ], 201);

        } catch (\Exception $e) {
            Log::error("Failed to save route with points: " . $e->getMessage(), $e->getTrace());
            return response()->json(['error' => 'An internal error occurred.'], 500);
        }
    }

    /**
     * --- NEW ---
     * Remove the specified route and its points.
     * Assumes your RoutePoint migration has onDelete('cascade')
     */
    public function destroy($id)
    {
        try {
            $route = Route::findOrFail($id);
            
            // This will also delete all associated route_points
            // if you set up 'onDelete('cascade')' in your migration.
            $route->delete();

            return response()->json(['message' => 'Route deleted successfully'], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Route not found'], 404);
        } catch (\Exception $e) {
            Log::error("Failed to delete route $id: " . $e->getMessage());
            return response()->json(['error' => 'An internal error occurred.'], 500);
        }
    }
}