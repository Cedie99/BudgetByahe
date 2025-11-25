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
    // AFTER
    public function up()
    {
        Schema::table('feedbacks', function (Blueprint $table) {
            // Check if the column DOESN'T exist before adding it
            if (!Schema::hasColumn('feedbacks', 'user_name')) {
                $table->string('user_name', 100)->nullable()->after('user_id');
            }

            // Check for the second column, too
            if (!Schema::hasColumn('feedbacks', 'user_email')) {
                $table->string('user_email', 150)->nullable()->after('user_name');
            }
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
