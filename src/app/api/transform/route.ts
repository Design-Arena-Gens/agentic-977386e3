import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPdf, splitPromptsFromText } from '@/src/lib/pdf';
import { batchTransform } from '@/src/lib/dna1980';
import { z } from 'zod';

export const runtime = 'nodejs';

const QuerySchema = z.object({
  intensity: z.coerce.number().min(0).max(1).default(0.75),
  tone: z.enum(['heroic','satirical','mystery','sci-fi','fantasy','action']).optional(),
  seed: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const parsed = QuerySchema.safeParse({
      intensity: searchParams.get('intensity') ?? undefined,
      tone: searchParams.get('tone') ?? undefined,
      seed: searchParams.get('seed') ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromPdf(bytes);
    const prompts = splitPromptsFromText(text);
    const transformed = batchTransform(prompts, parsed.data);

    return NextResponse.json({ count: prompts.length, prompts, transformed });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
