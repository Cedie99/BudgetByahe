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
        Schema::create('saved_routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('route_id')->constrained('routes')->onDelete('cascade');
            $table->string('alias', 100)->nullable()->comment('e.g., "Home to School"');
            $table->integer('frequency')->default(1)->comment('Increments each time user reuses this route');
            $table->timestamps();
            
            // Ensure unique user-route combinations
            $table->unique(['user_id', 'route_id']);
            
            // Index for frequency queries (popular routes)
            $table->index('frequency');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('saved_routes');
    }
};