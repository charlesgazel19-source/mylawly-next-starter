import { describe, it, expect, vi, afterEach } from "vitest";
import { GET } from "../app/api/documents/[id]/pdf/route";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("pdf route", () => {
  it("returns 400 if id is missing", async () => {
    const res = await GET(new Request("http://localhost/api"), { params: { id: "" } });
    expect(res.status).toBe(400);
  });

  it("returns 404 if doc is not found", async () => {
    vi.mock("@/lib/supabaseServer", () => ({
      supabaseServer: () => ({
        from: () => ({
          select: () => ({
            eq: () => ({
              single: async () => ({ data: null, error: null })
            })
          })
        })
      })
    }));
    const res = await GET(new Request("http://localhost/api"), { params: { id: "notfound" } });
    expect(res.status).toBe(404);
  });

  it("returns 200 and PDF headers if ok", async () => {
    vi.mock("@/lib/supabaseServer", () => ({
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
