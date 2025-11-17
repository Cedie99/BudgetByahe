<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TricycleFare; // <-- Import your model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator; // <-- Import the Validator

class TricycleFareController extends Controller
{
    /**
     * Store a new tricycle fare destination.
     */
    public function store(Request $request)
    {
        // 1. Validate the data from the form
        $validator = Validator::make($request->all(), [
            'place' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'fare' => 'required|numeric|min:0',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 2. Create and save the new destination
        $destination = TricycleFare::create($validator->validated());

        // 3. Send a success response back with the new data
        // (Your React code uses this to update the list)
        return response()->json([
            'message' => 'Tricycle destination saved!',
            'data' => $destination 
        ], 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $destination = TricycleFare::find($id);

        if (!$destination) {
            return response()->json(['error' => 'Destination not found'], 404);
        }

        $destination->delete();

        return response()->json(['message' => 'Destination deleted!']);
    }
}

