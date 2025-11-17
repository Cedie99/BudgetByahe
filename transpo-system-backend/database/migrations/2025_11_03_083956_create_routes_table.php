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
        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->string('route_name', 255);

            // --- THESE ARE THE CHANGES ---
            $table->foreignId('start_terminal_id')->nullable()->constrained('terminals')->onDelete('set null');
            $table->foreignId('end_terminal_id')->nullable()->constrained('terminals')->onDelete('set null');

            $table->decimal('start_latitude', 10, 7);
            $table->decimal('start_longitude', 10, 7);
            $table->decimal('end_latitude', 10, 7);
            $table->decimal('end_longitude', 10, 7);
            // --- END OF CHANGES ---

            $table->decimal('total_distance_km', 8, 2);
            $table->foreignId('transport_type_id')->constrained('transport_types')->onDelete('cascade');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            // Indexes for common queries
            $table->index(['transport_type_id', 'status']);
            $table->index('start_terminal_id');
            $table->index('end_terminal_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('routes');
    }
};