import { describe, it, expect, vi, afterEach } from "vitest";
import { POST } from "../app/api/documents/route";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/documents", () => {
  it("returns 201 and top-level id", async () => {
    const mockSupabase = () => ({
      from: () => ({
        insert: () => ({ select: () => ({ single: async () => ({ data: { id: "test-id", module_id: "mod", status: "draft", created_at: "now", updated_at: "now", user_id: "u" }, error: null }) }) }) })
      })
    });
    vi.mock("@/lib/supabaseServer", () => ({ supabaseServer: mockSupabase }));
    const req = new Request("http://localhost/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module_id: "mod", answers: {}, status: "draft" })
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toBeTruthy();
  });

  it("returns 400 if missing module_id", async () => {
    const req = new Request("http://localhost/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: {}, status: "draft" })
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
