<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('shelter_areas', function (Blueprint $table) {
        $table->id();

        // المنطقة تتبع ملجأ معين
        $table->foreignId('shelter_id')->constrained()->onDelete('cascade');

        $table->string('name');               
        // مثال: "Children Area", "Pets Area", "Sleeping Zone A"

        $table->string('type')->nullable();
        // مثال: children, pets, family, hall, prayer, storage

        $table->integer('capacity_total')->default(0);     
        $table->integer('capacity_current')->default(0);

        $table->boolean('is_active')->default(true);

        $table->timestamps();
});
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shelter_areas');
    }
};
