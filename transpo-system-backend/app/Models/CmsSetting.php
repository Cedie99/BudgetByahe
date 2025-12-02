<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CmsSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'description',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    /**
     * Get all settings grouped by group
     */
    public static function getGroupedSettings()
    {
        return self::where('is_active', true)
            ->orderBy('group')
            ->orderBy('key')
            ->get()
            ->groupBy('group');
    }

    /**
     * Get settings as key-value array
     */
    public static function getSettingsArray()
    {
        return self::where('is_active', true)
            ->pluck('value', 'key')
            ->toArray();
    }

    /**
     * Update or create a setting
     */
    public static function setSetting($key, $value, $type = 'text', $group = 'general', $description = null)
    {
        return self::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'type' => $type,
                'group' => $group,
                'description' => $description,
                'is_active' => true
            ]
        );
    }

    /**
     * Get a specific setting value
     */
    public static function getSetting($key, $default = null)
    {
        $setting = self::where('key', $key)
            ->where('is_active', true)
            ->first();

        return $setting ? $setting->value : $default;
    }
}