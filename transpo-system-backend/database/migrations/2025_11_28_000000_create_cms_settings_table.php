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
        Schema::create('cms_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // Setting key (e.g., 'navbar_brand', 'hero_title')
            $table->longText('value')->nullable(); // Setting value (supports large text/base64 images)
            $table->string('type')->default('text'); // Type: text, textarea, image, color, url, email, phone
            $table->string('group')->default('general'); // Group: navbar, hero, features, footer, colors, social
            $table->text('description')->nullable(); // Description for admins
            $table->boolean('is_active')->default(true); // Whether setting is active
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('cms_settings');
    }
};