<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
{
    Schema::create('notifications', function (Blueprint $table) {
        $table->id();
        $table->string('type');
        $table->string('title');
        $table->text('message');
        $table->string('region')->default('all');
        $table->string('target')->default('all');
        $table->string('status')->default('sent');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
