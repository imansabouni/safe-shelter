<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('card_members', function (Blueprint $table) {
            $table->id();

            // Card Relation (Aileye bağlı)
            $table->foreignId('card_id')
                  ->constrained('cards')
                  ->cascadeOnDelete();

            // Basic Info
            $table->string('name');
            $table->integer('age');
            $table->enum('gender', ['male','female']);

            // Aile içindeki rol
           // ENUM yerine string kullanıyoruz
            $table->string('role')->default('member');
            // Sağlık bilgisi
            $table->string('health_status')->nullable();

            // Bireysel QR kod (telefonu olan kişiler kullanır)
            $table->string('qr_code')->unique()->nullable();

            // Telefonu olmayan küçük çocuklar için
            $table->boolean('has_phone')->default(false);

            // Shelter Status
            $table->enum('status', [
                'outside',
                'inside'
            ])->default('outside');

            // Son görülen konum
            $table->string('last_location')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('card_members');
    }
};