import { describe, it, expect, vi, afterEach } from "vitest";
import { POST } from "@/app/api/documents/route";

vi.mock("@/lib/supabase", () => {
  const singleOk = async () => ({ data: { id: "doc-1", module_id: "m", status: "draft", created_at: "", updated_at: "" }, error: null });
  const singleErr = async (msg = "boom") => ({ data: null, error: { message: msg } });

  let nextSingleImpl = singleOk;

  const api = {
    supabaseServer: () => ({
      from: () => ({
        insert: () => ({
          select: () => ({
            single: () => nextSingleImpl(),
          }),
        }),
      }),
    }),
    __setSingleOk: () => { nextSingleImpl = singleOk; },
    __setSingleErr: (msg) => { nextSingleImpl = () => singleErr(msg); },
  };
  return api;
});

const supabaseMod = await import("@/lib/supabase");

afterEach(() => vi.restoreAllMocks());

describe("POST /api/documents", () => {
  it("400 when content-type is not application/json", async () => {
    const req = new Request("http://localhost/api/documents", { method: "POST", body: "{}" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("400 when body is missing fields", async () => {
    const req = new Request("http://localhost/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("201 when insert ok and returns Location", async () => {
    supabaseMod.__setSingleOk();
    const req = new Request("http://localhost/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module_id: "m", answers: { a: 1 }, status: "draft" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(res.headers.get("Location")).toContain("/api/documents/doc-1");
  });

  it("500 when supabase returns error", async () => {
    supabaseMod.__setSingleErr("db down");
    const req = new Request("http://localhost/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module_id: "m", answers: { a: 1 }, status: "draft" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
