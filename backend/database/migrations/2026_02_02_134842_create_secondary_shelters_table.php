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
        Schema::create('secondary_shelters', function (Blueprint $table) {
            $table->id();

            // MAIN shelter ile bağlantı
            $table->foreignId('main_shelter_id')
                  ->constrained('shelters')
                  ->onDelete('cascade');

            // Secondary bilgileri (harita & yönlendirme)
            $table->string('name');
            $table->string('district');
            $table->string('address')->nullable();

            // Harita koordinatları
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);

            // Durum
            $table->enum('status', ['active', 'inactive'])->default('active');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('secondary_shelters');
    }
};
