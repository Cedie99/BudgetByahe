<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Route;
use App\Models\Feedback;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function stats()
    {
        try {
            // Get user statistics
            $totalUsers = User::count();
            $usersThisMonth = User::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();

            // Get route statistics
            $totalRoutes = Route::count();
            $activeRoutes = Route::where('status', 'active')->count();

            // Get feedback statistics
            $totalFeedback = Feedback::count();
            $pendingFeedback = Feedback::where('status', 'pending')->count();
            $reviewedFeedback = Feedback::where('status', 'reviewed')->count();
            $resolvedFeedback = Feedback::where('status', 'resolved')->count();

            // Get recent feedback (last 5)
            $recentFeedback = Feedback::with('user')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($feedback) {
                    return [
                        'id' => $feedback->id,
                        'message' => $feedback->message,
                        'category' => $feedback->category,
                        'status' => $feedback->status,
                        'created_at' => $feedback->created_at,
                        'user_name' => $feedback->user_name ?? ($feedback->user ? $feedback->user->name : 'Anonymous'),
                        'user_email' => $feedback->user_email ?? ($feedback->user ? $feedback->user->email : null),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'users' => [
                        'total' => $totalUsers,
                        'this_month' => $usersThisMonth,
                    ],
                    'routes' => [
                        'total' => $totalRoutes,
                        'active' => $activeRoutes,
                    ],
                    'feedback' => [
                        'total' => $totalFeedback,
                        'pending' => $pendingFeedback,
                        'reviewed' => $reviewedFeedback,
                        'resolved' => $resolvedFeedback,
                    ],
                    'recent_feedback' => $recentFeedback,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
