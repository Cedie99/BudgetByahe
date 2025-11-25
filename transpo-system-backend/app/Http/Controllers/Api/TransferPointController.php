<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TransferPoint; // <-- Import the Model
use Illuminate\Support\Facades\Validator; // <-- Import the Validator

class TransferPointController extends Controller
{
    /**
     * Display a listing of all transfer points.
     * This is for the 'GET /api/transfer-points' route.
     */
    public function index()
    {
        // Use the Model to get all records from the 'transfer_points' table
        $points = TransferPoint::all();
        
        // Return them as JSON
        return response()->json($points);
    }

    /**
     * Store a newly created transfer point in storage.
     * This is for the 'POST /api/transfer-points' route.
     */
    public function store(Request $request)
    {
        // Validate the incoming data from the React form
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:transfer_points,name',
            'barangay' => 'required|string|max:255',
            'municipality' => 'required|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'type' => 'required|string|in:point', // Ensures type is 'point'
        ]);

        // If validation fails, send back a 422 error
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // If validation passes, create the new record
            // This works because of the $fillable array in the Model
            $point = TransferPoint::create($validator->validated());
            
            // Send back a success message and the new data
            return response()->json([
                'message' => 'Transfer point created successfully!',
                'data' => $point
            ], 201); // 201 means 'Created'

        } catch (\Exception $e) {
            // Catch any other database errors
            return response()->json([
                'error' => 'An error occurred while saving the point.',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $point = TransferPoint::find($id);

        if (!$point) {
            return response()->json(['error' => 'Transfer point not found'], 404);
        }

        try {
            $point->delete();
            return response()->json(['message' => 'Transfer point deleted successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred while deleting the point.',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}