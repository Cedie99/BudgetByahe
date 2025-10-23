<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Feedback;

class FeedbackController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer',
            'message' => 'required|string',
            'category' => 'required|string',
            'status' => 'string|nullable',
        ]);

        $validated['status'] = $validated['status'] ?? 'pending';

        $feedback = Feedback::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Feedback submitted successfully!',
            'data' => $feedback
        ], 201);
    }
}
