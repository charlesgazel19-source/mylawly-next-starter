/// <reference types="vitest" />
/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import DocumentView from "@/components/DocumentView";

describe("DocumentView", () => {
  it("affiche le titre du document", () => {
    render(
      <DocumentView doc={{ id: "1", title: "Test Document", status: "draft", created_at: "", updated_at: "", modules: [] }} />
    );
    expect(screen.getByText("Test Document")).toBeInTheDocument();
  });
});
