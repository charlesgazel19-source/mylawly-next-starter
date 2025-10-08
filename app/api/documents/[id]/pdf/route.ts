import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { ok: true, message: "PDF generation not yet implemented", id: params.id },
    { status: 202 }
  );
}
