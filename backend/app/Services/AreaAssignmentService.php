<?php

namespace App\Services;

use App\Models\Card;
use App\Models\ShelterArea;
use App\Models\AreaAssignment;
use Illuminate\Support\Facades\DB;
use Exception;

class AreaAssignmentService
{
    /**
     * توزيع عائلة على Area مناسبة
     */
    public function assignCardToArea(int $cardId, int $areaId)
    {
        return DB::transaction(function () use ($cardId, $areaId) {

            $card = Card::with('members')->findOrFail($cardId);
            $area = ShelterArea::findOrFail($areaId);

            $peopleCount = $card->members->count();

            // تحقق من السعة
            if ($area->capacity_current + $people > $area->capacity_total) {
            throw ValidationException::withMessages([
              'capacity' => 'Alan dolu'
           ]);
}

            // إنشاء التوزيع
            $assignment = AreaAssignment::create([
                'card_id' => $card->id,
                'area_id' => $area->id,
                'people_count' => $peopleCount,
            ]);

            // تحديث سعة المنطقة
            $area->capacity_current += $peopleCount;
            $area->save();

            return $assignment;
        });
    }
}
