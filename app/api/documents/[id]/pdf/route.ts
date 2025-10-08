import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { generatePdfFromDoc } from "@/lib/pdf";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = params?.id;
  if (!id) return NextResponse.json({ error: "Missing document id" }, { status: 400 });
  const supabase = supabaseServer();
  if (!supabase) return NextResponse.json({ error: "Supabase config missing" }, { status: 500 });
  const { data: doc, error } = await supabase
    .from("documents")
    .select("id, module_id, answers, status, created_at, updated_at, user_id")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: "Database error" }, { status: 500 });
  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
  try {
    const pdfBuffer = await generatePdfFromDoc(doc);
    // Convert Buffer to Uint8Array for Response compatibility
    const pdfArray = pdfBuffer instanceof Uint8Array ? pdfBuffer : new Uint8Array(pdfBuffer);
    return new Response(pdfArray, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=lawly-document-${doc.id}.pdf`,
        "Content-Length": pdfArray.length.toString(),
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
