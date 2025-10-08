import { describe, it, expect, vi } from "vitest";
import { POST } from "../app/api/documents/route";

describe("POST /api/documents", () => {
  it("returns 201 and top-level id", async () => {
    const mockSupabase = () => ({
      from: () => ({
        insert: () => ({ select: () => ({ single: () => ({ data: { id: "test-id", module_id: "mod", status: "draft", created_at: "now", updated_at: "now", user_id: "u" }, error: null }) }) }) })
      })
    });
    vi.mock("@/lib/supabaseServer", () => ({ supabaseServer: mockSupabase }));
    const req = new Request("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module_id: "mod", answers: {}, status: "draft" })
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toBe("test-id");
  });
});
