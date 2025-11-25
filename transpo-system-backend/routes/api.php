<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FareController;
use App\Http\Controllers\Api\TerminalController;
use App\Http\Controllers\Api\TransferPointController;
use App\Http\Controllers\Api\RouteController;
use App\Http\Controllers\Api\TricycleFareController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Test endpoint to verify API is working
Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'API is working!',
        'timestamp' => now()->toDateTimeString(),
        'database' => DB::connection()->getDatabaseName()
    ]);
});

Route::get('/fares/LTFRB', [FareController::class, 'getLtfrbFares']);
Route::get('/lgu-places', [FareController::class, 'getLguPlaces']);
Route::get('/fares/{place}', [FareController::class, 'getLguFareData']);
// 2. Get a list of all available LGU places (e.g., ["Santa Maria", "Bocaue"])
Route::get('/fares/LGU', [FareController::class, 'getLguPlaces']);

// 3. Get the specific fare data for one LGU place
Route::get('/fares/LGU/{place}', [FareController::class, 'getLguFareData']);

// 4. Upload data for either LTFRB or a specific LGU place
Route::post('/fares/upload', [FareController::class, 'uploadFares']);

Route::get('/terminals', [TerminalController::class, 'index']);
Route::post('/terminals', [TerminalController::class, 'store']);
Route::post('/terminals-with-fares', [TerminalController::class, 'storeWithFares']);
Route::delete('/terminals/{id}', [TerminalController::class, 'destroy']); 

Route::get('/transfer-points', [TransferPointController::class, 'index']);
Route::post('/transfer-points', [TransferPointController::class, 'store']);
Route::delete('/transfer-points/{id}', [TransferPointController::class, 'destroy']); 

Route::get('/routes', [RouteController::class, 'index']);
Route::get('/routes/{id}/points', [RouteController::class, 'showRoutePoints']);
Route::post('/routes-with-points', [RouteController::class, 'storeWithPoints']);
// --- NEW ---
// Route for admin panel to delete a route
Route::delete('/routes/{id}', [RouteController::class, 'destroy']);
// --- NEW ---
// Route for getting ALL routes with their paths (for MainFeature.js map display)
Route::get('/routes/all-paths', [RouteController::class, 'getAllRoutePaths']);

Route::get('/terminals/by-association/{association_name}', [TerminalController::class, 'findByAssociation']);

// This matches the POST request from your form
Route::post('/tricycle-fares', [TricycleFareController::class, 'store']);

// This matches the DELETE request for the "Delete" button
Route::delete('/tricycle-fares/{id}', [TricycleFareController::class, 'destroy']);

Route::post('/jeepney-fares/bulk', [FareController::class, 'bulkStoreJeepneyFares']);

// Feedback routes
Route::get('/feedback', [FeedbackController::class, 'index']);
Route::post('/feedback', [FeedbackController::class, 'store']);
Route::put('/feedback/{id}', [FeedbackController::class, 'update']);
Route::delete('/feedback/{id}', [FeedbackController::class, 'destroy']);
Route::get('/feedback/stats', [FeedbackController::class, 'stats']);

// User sync routes
Route::post('/users/sync', [UserController::class, 'syncFirebaseUser']);
Route::get('/users/firebase/{firebaseUid}', [UserController::class, 'getUserByFirebaseUid']);

// Dashboard statistics
Route::get('/dashboard/stats', [DashboardController::class, 'stats']);