import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { DataTable, type Column } from "@/components/data-table/data-table";

interface Row {
  id: string;
  name: string;
  score: number;
}

const rows: Row[] = Array.from({ length: 12 }, (_, i) => ({
  id: `r${i + 1}`,
  name: `Row ${String.fromCharCode(65 + i)}`,
  score: (i * 7) % 13,
}));

const columns: Column<Row>[] = [
  {
    key: "name",
    header: "Name",
    sortable: true,
    sortValue: (r) => r.name,
    exportValue: (r) => r.name,
    cell: (r) => r.name,
  },
  {
    key: "score",
    header: "Score",
    sortable: true,
    sortValue: (r) => r.score,
    exportValue: (r) => String(r.score),
    cell: (r) => r.score,
  },
];

function renderTable(extra = {}) {
  return render(
    <DataTable
      data={rows}
      columns={columns}
      getRowId={(r) => r.id}
      searchableText={(r) => r.name}
      pageSize={10}
      {...extra}
    />
  );
}

describe("<DataTable>", () => {
  it("paginates and reports the range", () => {
    renderTable();
    expect(screen.getByText(/Showing 1–10 of 12/)).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("filters via search", async () => {
    renderTable();
    await userEvent.type(screen.getByLabelText("Search table"), "Row A");
    expect(screen.getByText(/of 1/)).toBeInTheDocument();
  });

  it("sorts by a sortable column and exposes aria-sort", async () => {
    renderTable();
    await userEvent.click(screen.getByRole("button", { name: /Score/i }));
    const header = screen.getByRole("columnheader", { name: /Score/i });
    expect(header).toHaveAttribute("aria-sort", "ascending");
  });

  it("supports row selection and bulk action bar", async () => {
    renderTable({ bulkActions: () => <span>bulk</span> });
    const checkboxes = screen.getAllByRole("checkbox");
    // first checkbox is the header select-all
    await userEvent.click(checkboxes[1]);
    expect(screen.getByText(/1 selected/)).toBeInTheDocument();
    expect(screen.getByText("bulk")).toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    renderTable();
    await userEvent.type(screen.getByLabelText("Search table"), "zzzzz");
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = renderTable();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders the table landmark with rows", () => {
    renderTable();
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("row").length).toBeGreaterThan(1);
  });
});
