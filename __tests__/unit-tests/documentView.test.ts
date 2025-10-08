import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import DocumentView from "../components/DocumentView";

afterEach(() => {
  // Restore any mocks if used
});

describe("DocumentView", () => {
  it("affiche le titre du document", () => {
    render(
      <DocumentView doc={{ id: "1", title: "Test Document", status: "draft", created_at: "", updated_at: "", modules: [] }} />
    );
    expect(screen.getByText("Test Document")).toBeInTheDocument();
  });

  it("affiche les modules du document", () => {
    render(
      <DocumentView doc={{ id: "2", title: "Doc Modules", status: "draft", created_at: "", updated_at: "", modules: [{ title: "Module 1" }, { title: "Module 2" }] }} />
    );
    expect(screen.getByText("Module 1")).toBeInTheDocument();
    expect(screen.getByText("Module 2")).toBeInTheDocument();
  });
});
