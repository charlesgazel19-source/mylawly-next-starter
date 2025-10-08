import { describe, it, expect, vi, afterEach } from "vitest";
import * as supa from "@/lib/supabase";
import { GET } from "@/app/api/documents/[id]/pdf/route";
afterEach(() => vi.restoreAllMocks());

function mockSupabaseNotFound() {
  const single = vi.fn().mockResolvedValue({ data: null, error: null });
  const eq = vi.fn().mockReturnValue({ single });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });

  vi.spyOn(supa, "supabaseServer").mockReturnValue({ from } as any);
  return { from, select, eq, single };
}

describe("pdf route", () => {
  it("returns 400 if id is missing", async () => {
    const res = await GET(new Request("http://localhost/api"), { params: { id: "" } });
    expect(res.status).toBe(400);
  });

  it("returns 404 if doc is not found", async () => {
    mockSupabaseNotFound();
    const req = new Request("http://localhost/api/documents/abc/pdf");
    const res = await GET(req, { params: { id: "abc" } } as any);

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toEqual({ error: "not found" });
  });

  it("returns 200 and PDF headers if ok", async () => {
    vi.mock("@/lib/supabase", () => ({
      supabaseServer: () => ({
        from: () => ({
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: { id: "ok", module_id: "m", answers: {}, status: "draft", created_at: "", updated_at: "", user_id: "u" },
                error: null
              })
            })
          })
        })
      })
    }));
    vi.mock("@/lib/pdf", () => ({
      generatePdfFromDoc: vi.fn(() => new Uint8Array([1,2,3]))
    }));
    const res = await GET(new Request("http://localhost/api"), { params: { id: "ok" } });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Content-Disposition")).toContain("inline");
  });
});
