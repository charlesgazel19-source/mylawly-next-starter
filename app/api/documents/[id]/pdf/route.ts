import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { generatePdfFromDoc } from "@/lib/pdf";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: "Missing document id" }, { status: 400 });
  }
  const supabase = supabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase config missing" }, { status: 500 });
  }
  const { data: doc, error } = await supabase
    .from("documents")
    .select("id, title, description, modules, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[pdf] db error", error.message ?? error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
  try {
    const pdfBuffer = await generatePdfFromDoc(doc);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=lawly-document-${doc.id}.pdf`,
      },
    });
  } catch (e: any) {
    console.error("[pdf] generation error", e?.message || e);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
