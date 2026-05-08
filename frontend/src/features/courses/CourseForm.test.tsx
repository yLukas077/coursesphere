import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CourseForm } from "@/features/courses/CourseForm";

describe("CourseForm", () => {
  it("submits with filled values", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CourseForm onSubmit={onSubmit} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText(/nome do curso/i), { target: { value: "Test Course" } });
    fireEvent.change(screen.getByLabelText(/início/i), { target: { value: "2026-01-01" } });
    fireEvent.change(screen.getByLabelText(/término/i), { target: { value: "2026-02-01" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Test Course",
      description: "",
      start_date: "2026-01-01",
      end_date: "2026-02-01",
    });
  });

  it("calls onCancel", () => {
    const onCancel = vi.fn();
    render(<CourseForm onSubmit={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
