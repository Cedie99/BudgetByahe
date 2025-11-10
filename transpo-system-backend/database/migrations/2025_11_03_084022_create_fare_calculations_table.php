<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('fare_calculations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('route_id')->constrained('routes')->onDelete('cascade');
            $table->decimal('distance_km', 8, 2);
            $table->decimal('fare_amount', 8, 2);
            $table->foreignId('fare_matrix_id')->constrained('fare_matrix')->onDelete('cascade');
            $table->timestamp('created_at');
            
            // Indexes for analytics queries
            $table->index(['user_id', 'created_at']);
            $table->index(['route_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('fare_calculations');
    }
};
