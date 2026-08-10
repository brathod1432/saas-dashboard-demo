import {
  cn,
  formatCurrency,
  formatCompact,
  formatPercent,
  getInitials,
} from "@/lib/utils";

describe("utils", () => {
  it("merges tailwind classes with conflict resolution", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", false && "hidden", "font-bold")).toBe("text-sm font-bold");
  });

  it("formats currency without fractional digits", () => {
    expect(formatCurrency(1500)).toBe("$1,500");
  });

  it("formats compact numbers", () => {
    expect(formatCompact(12300)).toBe("12.3K");
    expect(formatCompact(1_200_000)).toBe("1.2M");
  });

  it("formats percentages from fractions", () => {
    expect(formatPercent(0.128)).toBe("12.8%");
  });

  it("derives up-to-two-letter initials", () => {
    expect(getInitials("Priya Sharma")).toBe("PS");
    expect(getInitials("Cher")).toBe("C");
  });
});
