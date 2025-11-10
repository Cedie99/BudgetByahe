<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Route;
use App\Models\Terminal;
use App\Models\TransportType;
use App\Models\RoutePoint;

class RouteController extends Controller
{
    /**
     * Get all active routes with terminals and transport type
     */
    public function index()
    {
        try {
            $routes = Route::with(['startTerminal', 'endTerminal', 'transportType', 'routePoints'])
                ->where('status', 'active')
                ->get()
                ->map(function ($route) {
                    return [
                        'id' => $route->id,
                        'route_name' => $route->route_name,
                        'start_terminal' => [
                            'id' => $route->startTerminal->id,
                            'name' => $route->startTerminal->name,
                            'barangay' => $route->startTerminal->barangay,
                            'municipality' => $route->startTerminal->municipality,
                            'latitude' => (float) $route->startTerminal->latitude,
                            'longitude' => (float) $route->startTerminal->longitude,
                        ],
                        'end_terminal' => [
                            'id' => $route->endTerminal->id,
                            'name' => $route->endTerminal->name,
                            'barangay' => $route->endTerminal->barangay,
                            'municipality' => $route->endTerminal->municipality,
                            'latitude' => (float) $route->endTerminal->latitude,
                            'longitude' => (float) $route->endTerminal->longitude,
                        ],
                        'transport_type' => [
                            'id' => $route->transportType->id,
                            'name' => $route->transportType->name,
                            'description' => $route->transportType->description,
                        ],
                        'total_distance_km' => (float) $route->total_distance_km,
                        'status' => $route->status,
                        'route_points' => $route->routePoints->map(function ($point) {
                            return [
                                'order' => $point->order_no,
                                'latitude' => (float) $point->latitude,
                                'longitude' => (float) $point->longitude,
                                'barangay_name' => $point->barangay_name,
                            ];
                        })->sortBy('order')->values(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $routes,
                'count' => $routes->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch routes',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single route by ID
     */
    public function show($id)
    {
        try {
            $route = Route::with(['startTerminal', 'endTerminal', 'transportType', 'routePoints'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $route->id,
                    'route_name' => $route->route_name,
                    'start_terminal' => [
                        'id' => $route->startTerminal->id,
                        'name' => $route->startTerminal->name,
                        'barangay' => $route->startTerminal->barangay,
                        'municipality' => $route->startTerminal->municipality,
                        'latitude' => (float) $route->startTerminal->latitude,
                        'longitude' => (float) $route->startTerminal->longitude,
                    ],
                    'end_terminal' => [
                        'id' => $route->endTerminal->id,
                        'name' => $route->endTerminal->name,
                        'barangay' => $route->endTerminal->barangay,
                        'municipality' => $route->endTerminal->municipality,
                        'latitude' => (float) $route->endTerminal->latitude,
                        'longitude' => (float) $route->endTerminal->longitude,
                    ],
                    'transport_type' => [
                        'id' => $route->transportType->id,
                        'name' => $route->transportType->name,
                        'description' => $route->transportType->description,
                    ],
                    'total_distance_km' => (float) $route->total_distance_km,
                    'status' => $route->status,
                    'route_points' => $route->routePoints->sortBy('order_no')->values()->map(function ($point) {
                        return [
                            'order' => $point->order_no,
                            'latitude' => (float) $point->latitude,
                            'longitude' => (float) $point->longitude,
                            'barangay_name' => $point->barangay_name,
                        ];
                    }),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Route not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Get routes by transport type
     */
    public function getByTransportType($transportType)
    {
        try {
            $routes = Route::with(['startTerminal', 'endTerminal', 'transportType', 'routePoints'])
                ->where('status', 'active')
                ->whereHas('transportType', function ($query) use ($transportType) {
                    $query->where('name', $transportType);
                })
                ->get();

            return response()->json([
                'success' => true,
                'data' => $routes,
                'count' => $routes->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch routes',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all terminals
     */
    public function getTerminals()
    {
        try {
            $terminals = Terminal::with('transportType')->get();

            return response()->json([
                'success' => true,
                'data' => $terminals,
                'count' => $terminals->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch terminals',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new route
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'route_name' => 'required|string|max:100',
                'start_terminal_id' => 'required|exists:terminals,id',
                'end_terminal_id' => 'required|exists:terminals,id|different:start_terminal_id',
                'transport_type_id' => 'required|exists:transport_types,id',
                'total_distance_km' => 'nullable|numeric|min:0',
                'status' => 'nullable|in:active,inactive',
            ]);

            $route = Route::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Route created successfully',
                'data' => $route->load(['startTerminal', 'endTerminal', 'transportType']),
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create route',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update an existing route
     */
    public function update(Request $request, $id)
    {
        try {
            $route = Route::findOrFail($id);

            $validated = $request->validate([
                'route_name' => 'sometimes|required|string|max:100',
                'start_terminal_id' => 'sometimes|required|exists:terminals,id',
                'end_terminal_id' => 'sometimes|required|exists:terminals,id|different:start_terminal_id',
                'transport_type_id' => 'sometimes|required|exists:transport_types,id',
                'total_distance_km' => 'nullable|numeric|min:0',
                'status' => 'nullable|in:active,inactive',
            ]);

            $route->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Route updated successfully',
                'data' => $route->load(['startTerminal', 'endTerminal', 'transportType']),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update route',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a route
     */
    public function destroy($id)
    {
        try {
            $route = Route::findOrFail($id);
            $route->delete();

            return response()->json([
                'success' => true,
                'message' => 'Route deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete route',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
