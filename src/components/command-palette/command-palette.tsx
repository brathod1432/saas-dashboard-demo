"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  FolderKanban,
  Users,
  CornerDownLeft,
  Search,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useUiStore } from "@/stores/ui-store";
import { useCustomers } from "@/hooks/use-customers";
import { useProjects } from "@/hooks/use-projects";
import { useInvoices } from "@/hooks/use-invoices";
import { useCurrentUser } from "@/components/auth/session-context";
import { NAV_SECTIONS } from "@/components/layout/nav-config";
import { hasPermission, type Permission } from "@/lib/rbac";
import { cn } from "@/lib/utils";

type Group = "Actions" | "Go to" | "Customers" | "Projects" | "Invoices";

interface Result {
  id: string;
  label: string;
  hint: string;
  href: string;
  icon: LucideIcon;
  group: Group;
}

const QUICK_ACTIONS: { label: string; href: string; permission: Permission }[] = [
  { label: "New customer", href: "/customers?new=1", permission: "customers:create" },
  { label: "New project", href: "/projects?new=1", permission: "projects:create" },
];

/**
 * Global command palette (⌘K / Ctrl+K). A launcher and search in one: quick-create
 * actions, jump-to-page navigation (permission-aware), and fuzzy entity search across
 * customers, projects, and invoices. Keyboard: ↑/↓ to move, Enter to open, Esc to close.
 */
export function CommandPalette() {
  const router = useRouter();
  const user = useCurrentUser();
  const open = useUiStore((s) => s.commandOpen);
  const setOpen = useUiStore((s) => s.setCommandOpen);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  // Data is React-Query cached, so this is cheap after first load.
  const { data: customers } = useCustomers();
  const { data: projects } = useProjects();
  const { data: invoices } = useInvoices();

  // Register the global keyboard shortcut.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useUiStore.getState().commandOpen);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    const take = <T,>(arr: T[] | undefined, n: number) => (arr ?? []).slice(0, n);
    const match = (text: string) => !q || text.toLowerCase().includes(q);

    const actionResults: Result[] = QUICK_ACTIONS.filter(
      (a) => hasPermission(user.role, a.permission) && match(a.label)
    ).map((a) => ({
      id: `action:${a.href}`,
      label: a.label,
      hint: "Action",
      href: a.href,
      icon: Plus,
      group: "Actions",
    }));

    const navResults: Result[] = NAV_SECTIONS.flatMap((s) => s.items)
      .filter((item) => hasPermission(user.role, item.permission) && match(item.label))
      .map((item) => ({
        id: `nav:${item.href}`,
        label: item.label,
        hint: "Page",
        href: item.href,
        icon: item.icon,
        group: "Go to",
      }));

    const customerResults: Result[] = take(customers, 200)
      .filter((c) => match(`${c.name} ${c.contactName} ${c.email}`))
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        label: c.name,
        hint: c.industry,
        href: `/customers/${c.id}`,
        icon: Users,
        group: "Customers",
      }));

    const projectResults: Result[] = take(projects, 200)
      .filter((p) => match(p.name))
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        label: p.name,
        hint: p.status,
        href: `/projects/${p.id}`,
        icon: FolderKanban,
        group: "Projects",
      }));

    const invoiceResults: Result[] = take(invoices, 200)
      .filter((i) => match(i.number))
      .slice(0, 5)
      .map((i) => ({
        id: i.id,
        label: i.number,
        hint: i.status,
        href: `/invoices`,
        icon: FileText,
        group: "Invoices",
      }));

    return [
      ...actionResults,
      ...navResults,
      ...customerResults,
      ...projectResults,
      ...invoiceResults,
    ];
  }, [query, customers, projects, invoices, user.role]);

  function go(result: Result) {
    setOpen(false);
    setQuery("");
    router.push(result.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  }

  let lastGroup: Group | null = null;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQuery("");
        setActive(0);
      }}
    >
      <DialogContent className="top-24 max-w-xl translate-y-0 gap-0 p-0">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="text-muted-foreground h-4 w-4 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search or jump to… (customers, projects, invoices, pages)"
            aria-label="Command palette search"
            className="placeholder:text-muted-foreground h-12 w-full bg-transparent text-sm outline-none"
          />
        </div>

        <ul ref={listRef} className="max-h-96 overflow-y-auto p-2" role="listbox">
          {results.length === 0 ? (
            <li className="text-muted-foreground px-3 py-6 text-center text-sm">
              No results{query ? ` for "${query}"` : ""}.
            </li>
          ) : (
            results.map((result, index) => {
              const Icon = result.icon;
              const showHeader = result.group !== lastGroup;
              lastGroup = result.group;
              return (
                <li
                  key={`${result.group}:${result.href}:${result.id}`}
                  role="option"
                  aria-selected={index === active}
                >
                  {showHeader && (
                    <p className="text-muted-foreground px-3 pt-2 pb-1 text-xs font-medium">
                      {result.group}
                    </p>
                  )}
                  <button
                    type="button"
                    onMouseEnter={() => setActive(index)}
                    onClick={() => go(result)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm",
                      index === active ? "bg-accent" : "hover:bg-accent/60"
                    )}
                  >
                    <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{result.label}</span>
                    <span className="text-muted-foreground truncate text-xs capitalize">
                      {result.hint}
                    </span>
                    {index === active && (
                      <CornerDownLeft className="text-muted-foreground h-3.5 w-3.5" />
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
