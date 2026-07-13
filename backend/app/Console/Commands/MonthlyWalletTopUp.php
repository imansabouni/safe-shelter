<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Card;

class MonthlyWalletTopUp extends Command
{
    /**
     * اسم الأمر
     */
    protected $signature = 'wallet:monthly-topup';

    /**
     * الوصف
     */
    protected $description = 'Add monthly 50 TL balance to all shelter cards';

    /**
     * تنفيذ الأمر
     */
    public function handle()
    {
        $this->info('Monthly wallet top-up started...');

        $cards = Card::all();

        if ($cards->isEmpty()) {
            $this->warn('No cards found.');
            return;
        }

        foreach ($cards as $card) {
            $card->balance += 50;
            $card->save();

            $this->line(
                "Card #{$card->id} ({$card->family_name}) new balance: {$card->balance} TL"
            );
        }

        $this->info('Monthly wallet top-up completed successfully.');
    }
}
