<?php

namespace App\Http\Controllers;

use App\Models\UnregisteredEntry;
use Illuminate\Http\Request;

class UnregisteredEntryController extends Controller
{
    public function index()
    {
        $entries = UnregisteredEntry::with('shelter')
            ->latest()
            ->get();

        return response()->json($entries);
    }

    public function store(Request $request)
    {
        $entry = UnregisteredEntry::create([
            'shelter_id' => $request->shelter_id,
            'people_count' => $request->people_count,
            'notes' => $request->notes
        ]);

        return response()->json($entry);
    }

    public function update(Request $request, $id)
    {
        $entry = UnregisteredEntry::findOrFail($id);

        $entry->update([
            'people_count' => $request->people_count
        ]);

        return response()->json($entry);
    }

    public function destroy($id)
    {
        $entry = UnregisteredEntry::findOrFail($id);

        $entry->delete();

        return response()->json([
            'message' => 'Deleted successfully'
        ]);
    }
}