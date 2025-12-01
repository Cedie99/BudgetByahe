<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CmsSetting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class CmsController extends Controller
{
    /**
     * Get all CMS settings
     */
    public function index(): JsonResponse
    {
        try {
            $settings = CmsSetting::getGroupedSettings();
            $settingsArray = CmsSetting::getSettingsArray();

            return response()->json([
                'success' => true,
                'data' => [
                    'grouped' => $settings,
                    'flat' => $settingsArray
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve CMS settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get settings as flat key-value array (for frontend consumption)
     */
    public function getSettings(): JsonResponse
    {
        try {
            $settings = CmsSetting::getSettingsArray();

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve CMS settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific setting by key
     */
    public function show(string $key): JsonResponse
    {
        try {
            $setting = CmsSetting::where('key', $key)
                ->where('is_active', true)
                ->first();

            if (!$setting) {
                return response()->json([
                    'success' => false,
                    'message' => 'Setting not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve setting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update or create multiple settings
     */
    public function updateSettings(Request $request): JsonResponse
    {
        try {
            $settings = $request->validate([
                'settings' => 'required|array',
                'settings.*.key' => 'required|string',
                'settings.*.value' => 'nullable|string',
                'settings.*.type' => 'nullable|string|in:text,textarea,image,color,url,email,phone',
                'settings.*.group' => 'nullable|string',
                'settings.*.description' => 'nullable|string'
            ]);

            $updatedSettings = [];

            foreach ($settings['settings'] as $settingData) {
                $setting = CmsSetting::setSetting(
                    $settingData['key'],
                    $settingData['value'] ?? '',
                    $settingData['type'] ?? 'text',
                    $settingData['group'] ?? 'general',
                    $settingData['description'] ?? null
                );

                $updatedSettings[] = $setting;
            }

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
                'data' => $updatedSettings
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update or create a single setting
     */
    public function updateSetting(Request $request, string $key): JsonResponse
    {
        try {
            $data = $request->validate([
                'value' => 'nullable|string',
                'type' => 'nullable|string|in:text,textarea,image,color,url,email,phone',
                'group' => 'nullable|string',
                'description' => 'nullable|string'
            ]);

            $setting = CmsSetting::setSetting(
                $key,
                $data['value'] ?? '',
                $data['type'] ?? 'text',
                $data['group'] ?? 'general',
                $data['description'] ?? null
            );

            return response()->json([
                'success' => true,
                'message' => 'Setting updated successfully',
                'data' => $setting
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update setting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a setting
     */
    public function destroy(string $key): JsonResponse
    {
        try {
            $setting = CmsSetting::where('key', $key)->first();

            if (!$setting) {
                return response()->json([
                    'success' => false,
                    'message' => 'Setting not found'
                ], 404);
            }

            // Soft delete by setting is_active to false
            $setting->update(['is_active' => false]);

            return response()->json([
                'success' => true,
                'message' => 'Setting deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete setting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore a soft-deleted setting
     */
    public function restore(string $key): JsonResponse
    {
        try {
            $setting = CmsSetting::where('key', $key)->first();

            if (!$setting) {
                return response()->json([
                    'success' => false,
                    'message' => 'Setting not found'
                ], 404);
            }

            $setting->update(['is_active' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Setting restored successfully',
                'data' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore setting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get settings by group
     */
    public function getByGroup(string $group): JsonResponse
    {
        try {
            $settings = CmsSetting::where('group', $group)
                ->where('is_active', true)
                ->orderBy('key')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve settings by group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset settings to default values
     */
    public function resetToDefaults(): JsonResponse
    {
        try {
            // This would typically run the CmsSettingsSeeder
            \Artisan::call('db:seed', ['--class' => 'CmsSettingsSeeder']);

            return response()->json([
                'success' => true,
                'message' => 'Settings reset to defaults successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset settings to defaults',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}