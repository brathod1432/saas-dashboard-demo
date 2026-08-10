import {
  LoginSchema,
  RegisterSchema,
  CustomerCreateSchema,
} from "@/lib/validation/schemas";

describe("validation schemas", () => {
  it("accepts a valid login", () => {
    const result = LoginSchema.safeParse({ email: "a@b.com", password: "secret" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email and short password", () => {
    const result = LoginSchema.safeParse({ email: "nope", password: "123" });
    expect(result.success).toBe(false);
  });

  it("enforces password confirmation match on register", () => {
    const base = {
      name: "Jane Doe",
      email: "jane@acme.com",
      company: "Acme",
      password: "Password1",
      confirmPassword: "Password2",
      acceptTerms: true as const,
    };
    expect(RegisterSchema.safeParse(base).success).toBe(false);
    expect(
      RegisterSchema.safeParse({ ...base, confirmPassword: "Password1" }).success
    ).toBe(true);
  });

  it("requires accepting terms", () => {
    const result = RegisterSchema.safeParse({
      name: "Jane Doe",
      email: "jane@acme.com",
      company: "Acme",
      password: "Password1",
      confirmPassword: "Password1",
      acceptTerms: false,
    });
    expect(result.success).toBe(false);
  });

  it("validates customer creation input", () => {
    const valid = CustomerCreateSchema.safeParse({
      name: "Acme",
      contactName: "Jane",
      email: "jane@acme.com",
      phone: "1234567",
      industry: "Tech",
      tier: "business",
      status: "active",
      mrr: 1000,
    });
    expect(valid.success).toBe(true);

    const invalid = CustomerCreateSchema.safeParse({
      name: "A",
      contactName: "",
      email: "bad",
      phone: "1",
      industry: "",
      tier: "gold",
      status: "active",
      mrr: -5,
    });
    expect(invalid.success).toBe(false);
  });
});
