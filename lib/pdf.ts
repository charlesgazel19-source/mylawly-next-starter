// Stub PDF generator for Lawly
import { PDFDocument, StandardFonts } from "pdf-lib";
export type DocumentType = {
  id: string;
  title?: string;
  modules?: any[];
  created_at?: string;
  updated_at?: string;
  user_id?: string;
};

export async function generatePdfFromDoc(doc: DocumentType): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const page = pdfDoc.addPage([595, 842]); // A4
    let y = 800;
    function draw(text: string, size = 14) {
      page.drawText(text, { x: 50, y, size, font });
      y -= size + 8;
    }
    draw(`Document: ${doc.title ?? doc.id}`, 18);
    // Fallback description: concat module titles or default
    let desc = "Aucune description disponible.";
    if (Array.isArray(doc.modules) && doc.modules.length > 0) {
      const titles = doc.modules.map((m: any) => m.title).filter(Boolean).join(", ");
      if (titles) desc = `Modules: ${titles}`;
    }
    draw(desc, 14);
    if (doc.created_at) draw(`Date: ${doc.created_at}`, 12);
    if (Array.isArray(doc.modules) && doc.modules.length > 0) {
      draw("Modules:", 14);
      doc.modules.forEach((mod: any, i: number) => {
        draw(`- ${mod.title ?? mod.id}`, 12);
        if (Array.isArray(mod.steps)) {
          mod.steps.forEach((step: any) => {
            draw(`  • ${step.label ?? step.question ?? ""}: ${step.answer ?? ""}`, 11);
          });
        }
      });
    } else {
      draw("Aucun module associé.", 12);
    }
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (e: any) {
    console.error("[pdf-lib] PDF generation error:", e?.message || e);
    throw new Error("PDF generation failed");
  }
}
