<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DocumentRequest;
use App\Models\Document;
use Illuminate\Http\JsonResponse;

class DocumentController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Document::query()->with('userProgram')->latest()->paginate(15));
    }

    public function store(DocumentRequest $request): JsonResponse
    {
        return response()->json(Document::create($request->validated()), 201);
    }

    public function show(Document $document): JsonResponse
    {
        return response()->json($document->load('userProgram'));
    }

    public function update(DocumentRequest $request, Document $document): JsonResponse
    {
        $document->update($request->validated());

        return response()->json($document->refresh());
    }

    public function destroy(Document $document): JsonResponse
    {
        $document->delete();

        return response()->json(['message' => 'Document deleted.']);
    }
}
