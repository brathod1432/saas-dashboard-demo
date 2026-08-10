import { applyQuery } from "@/lib/api/repositories/query";

interface Row {
  id: string;
  name: string;
  status: string;
  amount: number;
}

const rows: Row[] = [
  { id: "1", name: "Alpha", status: "active", amount: 30 },
  { id: "2", name: "Bravo", status: "churned", amount: 10 },
  { id: "3", name: "Charlie", status: "active", amount: 20 },
  { id: "4", name: "Delta", status: "active", amount: 40 },
];

describe("applyQuery", () => {
  it("searches across configured fields", () => {
    const result = applyQuery(rows, { search: "brav" }, { searchFields: ["name"] });
    expect(result.total).toBe(1);
    expect(result.data[0].name).toBe("Bravo");
  });

  it("filters by status", () => {
    const result = applyQuery(rows, { status: "active" }, { searchFields: ["name"] });
    expect(result.total).toBe(3);
  });

  it("sorts ascending and descending", () => {
    const asc = applyQuery(
      rows,
      { sortBy: "amount", sortDir: "asc" },
      { searchFields: ["name"] }
    );
    expect(asc.data.map((r) => r.amount)).toEqual([10, 20, 30, 40]);

    const desc = applyQuery(
      rows,
      { sortBy: "amount", sortDir: "desc" },
      { searchFields: ["name"] }
    );
    expect(desc.data.map((r) => r.amount)).toEqual([40, 30, 20, 10]);
  });

  it("paginates results", () => {
    const page1 = applyQuery(
      rows,
      { page: 1, pageSize: 2 },
      { searchFields: ["name"], defaultSort: "name" }
    );
    expect(page1.data).toHaveLength(2);
    expect(page1.total).toBe(4);
    expect(page1.data[0].name).toBe("Alpha");

    const page2 = applyQuery(
      rows,
      { page: 2, pageSize: 2 },
      { searchFields: ["name"], defaultSort: "name" }
    );
    expect(page2.data[0].name).toBe("Charlie");
  });
});
