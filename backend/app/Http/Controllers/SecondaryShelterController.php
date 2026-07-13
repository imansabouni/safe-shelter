<?php

namespace App\Http\Controllers;

use App\Models\SecondaryShelter;
use Illuminate\Http\Request;

class SecondaryShelterController extends Controller
{
    // Tüm secondary sığınaklar
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => SecondaryShelter::all()
        ]);
    }

    // Mahalleye göre secondary sığınaklar
    public function byNeighborhood(Request $request)
    {
        $request->validate([
            'neighborhood' => 'required|string'
        ]);

        $items = SecondaryShelter::where('address', $request->neighborhood)
            ->where('status', 'active')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $items->count(),
            'data' => $items
        ]);
    }
}
