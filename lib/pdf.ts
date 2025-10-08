// Stub PDF generator for Lawly
import { DocumentType } from "@/components/DocumentView";

export async function generatePdfFromDoc(doc: DocumentType): Promise<Buffer> {
  // TODO: Replace with real PDF generation (e.g. pdfkit, puppeteer, etc.)
  const content = `Document: ${doc.title ?? doc.id}\nDescription: ${doc.description ?? ""}\nDate: ${doc.created_at ?? ""}`;
  return Buffer.from(content, "utf-8");
}
