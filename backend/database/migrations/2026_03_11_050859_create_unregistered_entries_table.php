<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   
   public function up()
{
    Schema::create('unregistered_entries', function (Blueprint $table) {
        $table->id();
        $table->foreignId('shelter_id')->nullable()->constrained()->nullOnDelete();
        $table->integer('people_count');
        $table->text('notes')->nullable();
        $table->timestamps();
        
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unregistered_entries');
    }
};
