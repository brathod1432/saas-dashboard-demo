import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";

describe("state components", () => {
  it("renders an empty state with an action", () => {
    render(<EmptyState title="Nothing here" action={<button>Add</button>} />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("error state exposes an alert role and retry", async () => {
    const onRetry = jest.fn();
    render(<ErrorState onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("maps status values to human labels", () => {
    render(<StatusBadge value="on_hold" />);
    expect(screen.getByText("On hold")).toBeInTheDocument();
  });

  it("empty state has no a11y violations", async () => {
    const { container } = render(<EmptyState title="Empty" description="None" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
