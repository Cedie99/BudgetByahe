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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('route_id')->nullable()->constrained('routes')->onDelete('set null');
            $table->text('description');
            $table->enum('report_type', ['fare_issue', 'route_issue', 'system_issue'])->default('system_issue');
            $table->enum('status', ['open', 'in_progress', 'closed'])->default('open');
            $table->timestamps();
            
            // Indexes for admin management
            $table->index(['status', 'created_at']);
            $table->index('report_type');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('reports');
    }
};
