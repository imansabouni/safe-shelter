<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**b
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shelters', function (Blueprint $table) {
            $table->id();

            $table->string('name');                        // اسم الملجأ
            $table->string('district');                    // المنطقة
            $table->string('address')->nullable();

            $table->enum('type', ['main', 'secondary'])->default('main');

            $table->integer('capacity_total')->default(0);
            $table->integer('capacity_current')->default(0);

            $table->enum('status', ['open', 'closed', 'preparing'])->default('closed');

            // خدمات داخليه
            $table->boolean('has_children_area')->default(false);
            $table->boolean('has_animals_area')->default(false);
            $table->boolean('has_medical_service')->default(false);
            $table->boolean('has_prayer_room')->default(false);

            $table->string('internal_map')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shelters');
    }
};
