declare module 'pdf-parse' {
  export interface PdfParseResult {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: any;
    text: string;
    version: string;
  }
  function pdfParse(data: Buffer): Promise<PdfParseResult>;
  export default pdfParse;
}
