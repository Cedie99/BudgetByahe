<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Add GPS coordinate columns to routes table for map-based features
     * and direct distance calculations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('routes', function (Blueprint $table) {
            // Add GPS coordinates after end_terminal_id
            $table->decimal('start_latitude', 10, 7)->nullable()->after('end_terminal_id');
            $table->decimal('start_longitude', 10, 7)->nullable()->after('start_latitude');
            $table->decimal('end_latitude', 10, 7)->nullable()->after('start_longitude');
            $table->decimal('end_longitude', 10, 7)->nullable()->after('end_latitude');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('routes', function (Blueprint $table) {
            $table->dropColumn(['start_latitude', 'start_longitude', 'end_latitude', 'end_longitude']);
        });
    }
};
