<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// --- ADD THESE 'use' STATEMENTS ---
use App\Models\JeepneyFare;
use App\Models\TricycleFare;

class Terminal extends Model
{
    use HasFactory;

    protected $table = 'terminals';

    protected $fillable = [
        'name',
        'association_name',
        'barangay',
        'municipality',
        'latitude',
        'longitude',
        'transport_type_id',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    /**
     * --- REMOVE THE OLD fares() FUNCTION ---
     * public function fares() { ... }
     */

    /**
     * --- ADD THIS RELATIONSHIP ---
     * A terminal can have many Jeepney Fares.
     * This assumes your 'jeepney_fares' table has a 'terminal_id' column.
     */
    public function jeepneyFares()
    {
        return $this->hasMany(JeepneyFare::class);
    }

    /**
     * --- ADD THIS RELATIONSHIP ---
     * A terminal can have many Tricycle Fares.
     * This assumes your 'tricycle_fares' table has a 'terminal_id' column.
     */
    public function tricycleFares()
    {
        return $this->hasMany(TricycleFare::class);
    }
}