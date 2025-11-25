<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Sync Firebase user to MySQL database
     */
    public function syncFirebaseUser(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'firebase_uid' => 'required|string',
                'email' => 'required|email',
                'name' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $data = $validator->validated();

            // First, check if user exists by firebase_uid
            $userByFirebaseUid = User::where('firebase_uid', $data['firebase_uid'])->first();
            
            if ($userByFirebaseUid) {
                // User found by firebase_uid - just update the info
                $userByFirebaseUid->update([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'last_login_at' => now(),
                ]);
                $user = $userByFirebaseUid;
            } else {
                // Not found by firebase_uid, check by email
                $userByEmail = User::where('email', $data['email'])->first();
                
                if ($userByEmail) {
                    // User exists with this email but different/no firebase_uid
                    // Update the existing record with the firebase_uid
                    $userByEmail->update([
                        'firebase_uid' => $data['firebase_uid'],
                        'name' => $data['name'],
                        'last_login_at' => now(),
                    ]);
                    $user = $userByEmail;
                } else {
                    // Create new user - doesn't exist by firebase_uid or email
                    $user = User::create([
                        'firebase_uid' => $data['firebase_uid'],
                        'name' => $data['name'],
                        'email' => $data['email'],
                        'role' => 'user',
                        'password' => bcrypt(uniqid()), // Generate random password for Firebase users
                        'last_login_at' => now(),
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'User synced successfully',
                'data' => [
                    'id' => $user->id,
                    'firebase_uid' => $user->firebase_uid,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
            ]);
        } catch (\Exception $e) {
            // Log the full error for debugging
            \Log::error('User sync failed: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync user',
                'error' => $e->getMessage(),
                'details' => config('app.debug') ? $e->getTraceAsString() : null,
            ], 500);
        }
    }

    /**
     * Get user by Firebase UID
     */
    public function getUserByFirebaseUid($firebaseUid)
    {
        try {
            $user = User::where('firebase_uid', $firebaseUid)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'firebase_uid' => $user->firebase_uid,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'profile_photo' => $user->profile_photo,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
