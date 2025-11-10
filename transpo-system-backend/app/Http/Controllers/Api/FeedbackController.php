<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Feedback;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

class FeedbackController extends Controller
{
    /**
     * Get all feedback (for admin)
     */
    public function index(Request $request)
    {
        try {
            $query = Feedback::with('user');

            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Filter by category
            if ($request->has('category') && $request->category !== 'all') {
                $query->where('category', $request->category);
            }

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('message', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($userQuery) use ($search) {
                          $userQuery->where('name', 'like', "%{$search}%")
                                    ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            $feedback = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $feedback,
                'count' => $feedback->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch feedback',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Submit new feedback
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'nullable|exists:users,id',
                'firebase_uid' => 'nullable|string',
                'message' => 'required|string|min:10|max:1000',
                'category' => 'required|in:suggestion,bug,fare_discrepancy,general',
                'user_name' => 'required_without:user_id|string|max:100',
                'user_email' => 'required_without:user_id|email|max:150',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $data = $validator->validated();
            
            // If firebase_uid is provided, find or create user
            if (!empty($data['firebase_uid'])) {
                $user = User::where('firebase_uid', $data['firebase_uid'])->first();
                if ($user) {
                    $data['user_id'] = $user->id;
                }
            }

            // Set default status
            $data['status'] = 'pending';

            $feedback = Feedback::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Feedback submitted successfully! We will review it shortly.',
                'data' => $feedback,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit feedback',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update feedback status (admin only)
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,reviewed,resolved',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid status',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $feedback = Feedback::findOrFail($id);
            $feedback->status = $request->status;
            $feedback->save();

            return response()->json([
                'success' => true,
                'message' => 'Feedback status updated successfully',
                'data' => $feedback,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update feedback status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete feedback (admin only)
     */
    public function destroy($id)
    {
        try {
            $feedback = Feedback::findOrFail($id);
            $feedback->delete();

            return response()->json([
                'success' => true,
                'message' => 'Feedback deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete feedback',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get feedback statistics (admin dashboard)
     */
    public function stats()
    {
        try {
            $total = Feedback::count();
            $pending = Feedback::where('status', 'pending')->count();
            $reviewed = Feedback::where('status', 'reviewed')->count();
            $resolved = Feedback::where('status', 'resolved')->count();

            $byCategory = Feedback::selectRaw('category, count(*) as count')
                ->groupBy('category')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $total,
                    'pending' => $pending,
                    'reviewed' => $reviewed,
                    'resolved' => $resolved,
                    'by_category' => $byCategory,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
