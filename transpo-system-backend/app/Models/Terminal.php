<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Terminal extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'association_name',
        'barangay',
        'municipality',
        'latitude',
        'longitude',
        'transport_type_id',
    ];

    /**
     * Get the transport type
     */
    public function transportType()
    {
        return $this->belongsTo(TransportType::class);
    }
}
