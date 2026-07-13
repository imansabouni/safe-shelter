<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qr_logs', function (Blueprint $table) {
            $table->id();

            // Hangi kişi giriş yaptı
            $table->foreignId('member_id')
                ->constrained('card_members')
                ->cascadeOnDelete();

            // Hangi sığınağa
            $table->foreignId('shelter_id')
                ->constrained('shelters')
                ->cascadeOnDelete();

            // Giriş / Çıkış
            $table->enum('type', ['entry', 'exit']);

            // Sığınak içindeki bölüm (opsiyonel)
            $table->string('section')->nullable();

            // İşlemi yapan kişi (QR okutan kullanıcı)
            $table->foreignId('performed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Not (opsiyonel)
            $table->text('note')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qr_logs');
    }
};