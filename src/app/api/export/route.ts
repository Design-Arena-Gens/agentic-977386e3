import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import PDFDocument from 'pdfkit';

export const runtime = 'nodejs';

const BodySchema = z.object({
  transformed: z.array(z.string()),
  format: z.enum(['txt','csv','pdf']).default('txt'),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { transformed, format } = parsed.data;
    if (format === 'txt') {
      const body = transformed.join('\n\n---\n\n');
      return new NextResponse(body, {
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'content-disposition': 'attachment; filename="transformed.txt"'
        }
      });
    }
    if (format === 'csv') {
      const header = 'index,prompt';
      const rows = transformed.map((t, i) => `${i+1},"${t.replace(/"/g,'""')}"`).join('\n');
      const body = `${header}\n${rows}`;
      return new NextResponse(body, {
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': 'attachment; filename="transformed.csv"'
        }
      });
    }

    // pdf
    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    const chunks: Buffer[] = [];
    return await new Promise<NextResponse>((resolve, reject) => {
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => {
        const buff = Buffer.concat(chunks);
        resolve(new NextResponse(buff, {
          headers: {
            'content-type': 'application/pdf',
            'content-disposition': 'attachment; filename="transformed.pdf"'
          }
        }));
      });
      doc.on('error', reject);

      doc.fontSize(18).fillColor('#111').text('1980s Animation DNA — Transformed Prompts', { align: 'left' });
      doc.moveDown();
      transformed.forEach((t, idx) => {
        doc.fontSize(12).fillColor('#000').text(`${idx+1}.`, { continued: true });
        doc.fontSize(12).fillColor('#333').text(' ' + t);
        doc.moveDown(0.6);
      });

      doc.end();
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
