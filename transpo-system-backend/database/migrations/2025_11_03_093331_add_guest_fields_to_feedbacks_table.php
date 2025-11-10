<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Make user_id nullable using raw SQL
        DB::statement('ALTER TABLE feedbacks MODIFY user_id BIGINT UNSIGNED NULL');
        
        Schema::table('feedbacks', function (Blueprint $table) {
            // Add fields for guest feedback
            $table->string('user_name', 100)->nullable()->after('user_id');
            $table->string('user_email', 150)->nullable()->after('user_name');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('feedbacks', function (Blueprint $table) {
            $table->dropColumn(['user_name', 'user_email']);
        });
    }
};
