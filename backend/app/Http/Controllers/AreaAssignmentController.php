<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AreaAssignmentService;
use Exception;

class AreaAssignmentController extends Controller
{
    protected AreaAssignmentService $service;

    public function __construct(AreaAssignmentService $service)
    {
        $this->service = $service;
    }

    /**
     * Card → Area توزيع
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'card_id' => 'required|exists:cards,id',
            'area_id' => 'required|exists:shelter_areas,id',
        ]);

        try {
            $assignment = $this->service->assignCardToArea(
                $validated['card_id'],
                $validated['area_id']
            );

            return response()->json([
                'success' => true,
                'message' => 'Aile alana başarıyla yerleştirildi',
                'data' => $assignment
            ], 201, [], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        } catch (Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422, [], JSON_UNESCAPED_UNICODE);
        }
    }
}
