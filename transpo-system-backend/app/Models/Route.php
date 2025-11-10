<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Route extends Model
{
    use HasFactory;

    protected $fillable = [
        'route_name',
        'start_terminal_id',
        'end_terminal_id',
        'total_distance_km',
        'transport_type_id',
        'status',
    ];

    /**
     * Get the starting terminal
     */
    public function startTerminal()
    {
        return $this->belongsTo(Terminal::class, 'start_terminal_id');
    }

    /**
     * Get the ending terminal
     */
    public function endTerminal()
    {
        return $this->belongsTo(Terminal::class, 'end_terminal_id');
    }

    /**
     * Get the transport type
     */
    public function transportType()
    {
        return $this->belongsTo(TransportType::class);
    }

    /**
     * Get the route points
     */
    public function routePoints()
    {
        return $this->hasMany(RoutePoint::class)->orderBy('order_no');
    }
}
