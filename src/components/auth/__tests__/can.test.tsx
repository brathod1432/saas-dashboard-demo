import { render, screen } from "@testing-library/react";
import { SessionProvider } from "@/components/auth/session-context";
import { Can } from "@/components/auth/can";
import type { User } from "@/lib/types";

function makeUser(role: User["role"]): User {
  return {
    id: "u1",
    name: "Test User",
    email: "t@x.com",
    role,
    avatarColor: "#000",
    title: "T",
    department: "D",
    lastActiveAt: new Date().toISOString(),
  };
}

function renderWithRole(role: User["role"]) {
  return render(
    <SessionProvider user={makeUser(role)}>
      <Can permission="customers:create" fallback={<span>hidden</span>}>
        <button>Create customer</button>
      </Can>
    </SessionProvider>
  );
}

describe("<Can> permission gate", () => {
  it("renders children when the role has the permission", () => {
    renderWithRole("admin");
    expect(screen.getByRole("button", { name: /create customer/i })).toBeInTheDocument();
  });

  it("renders fallback when the role lacks the permission", () => {
    renderWithRole("viewer");
    expect(
      screen.queryByRole("button", { name: /create customer/i })
    ).not.toBeInTheDocument();
    expect(screen.getByText("hidden")).toBeInTheDocument();
  });
});
