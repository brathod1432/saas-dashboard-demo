import { parseCsv } from "@/lib/csv";

describe("parseCsv", () => {
  it("parses headers and rows", () => {
    const { headers, rows } = parseCsv("name,mrr\nAcme,5000\nGlobex,12000");
    expect(headers).toEqual(["name", "mrr"]);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ name: "Acme", mrr: "5000" });
  });

  it("handles quoted fields with commas and escaped quotes", () => {
    const { rows } = parseCsv('name,note\n"Acme, Inc","She said ""hi"""');
    expect(rows[0].name).toBe("Acme, Inc");
    expect(rows[0].note).toBe('She said "hi"');
  });

  it("handles CRLF line endings and trailing newline", () => {
    const { rows } = parseCsv("a,b\r\n1,2\r\n");
    expect(rows).toEqual([{ a: "1", b: "2" }]);
  });

  it("returns empty for empty input", () => {
    expect(parseCsv("")).toEqual({ headers: [], rows: [] });
  });
});
