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
        Schema::create('cards', function (Blueprint $table) {
            $table->id();

            // Kartı oluşturan kullanıcı
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Bireysel mi Aile mi
            $table->boolean('is_family')->default(false);

            // Aile adı (bireysel kullanıcıda kişinin adı olabilir)
            $table->string('family_name');

            // Aileye katılmak için kod
            $table->string('family_code')->unique();

            // İletişim telefonu
            $table->string('contact_phone')->nullable();

            // Evcil hayvan bilgisi
            $table->boolean('has_pet')->default(false);
            $table->string('pet_type')->nullable();
            $table->boolean('pet_inside')->default(false);

            // Yardım sistemi için bakiye (opsiyonel)
            $table->decimal('balance', 10, 2)->default(0);

            // Notlar
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cards');
    }
};