<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Kreait\Laravel\Firebase\Facades\FirebaseAuth as FirebaseFacade; // facade
// or use dependency-injection of Kreait\Firebase\Auth

class FirebaseAuthController extends Controller
{
    public function authenticate(Request $request)
    {
        $idTokenString = $request->input('idToken');

        if (!$idTokenString) {
            return response()->json(['message' => 'No ID token provided'], 400);
        }

        try {
            $verifiedIdToken = FirebaseFacade::verifyIdToken($idTokenString);
            $uid = $verifiedIdToken->claims()->get('sub');
            $firebaseUser = FirebaseFacade::getUser($uid);

            // Map to local user by email
            $email = $firebaseUser->email ?? null;
            if (!$email) {
                return response()->json(['message' => 'No email in Firebase user'], 400);
            }

            $user = User::firstOrCreate(
                ['email' => $email],
                ['name' => $firebaseUser->displayName ?? $email]
            );

            // Option A: create Sanctum token and return it
            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'status' => 'ok',
                'token' => $token,
                'user' => $user,
            ], 200);

            // Option B: Log the user in and let Laravel create session cookie
            // Auth::login($user);
            // return response()->json(['status'=>'ok']);
        } catch (\Kreait\Firebase\Exception\Auth\FailedToVerifyToken $e) {
            return response()->json(['message' => 'Invalid token', 'error' => $e->getMessage()], 401);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Error verifying token', 'error' => $e->getMessage()], 500);
        }
    }

    public function logout(Request $request) {
        // If you use tokens:
        $user = $request->user();
        if ($user) {
            $user->tokens()->delete();
        }
        return response()->json(['status' => 'logged out']);
    }
}