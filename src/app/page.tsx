import Link from "next/link";
import {
  Boxes,
  ShieldCheck,
  Accessibility,
  Activity,
  LayoutDashboard,
  Table2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Security-first",
    description:
      "RBAC, protected routing, session abstraction, audit trail, security headers.",
  },
  {
    icon: Accessibility,
    title: "Accessible",
    description: "WCAG AA target: keyboard nav, ARIA, focus management, reduced motion.",
  },
  {
    icon: Activity,
    title: "Observable",
    description:
      "Structured logging, metrics, tracing spans, and health checks built in.",
  },
  {
    icon: LayoutDashboard,
    title: "Real dashboards",
    description: "KPIs, charts, activity, and alerts powered by a typed mock API layer.",
  },
  {
    icon: Table2,
    title: "Enterprise tables",
    description:
      "Sort, filter, search, paginate, bulk actions, column visibility, CSV export.",
  },
  {
    icon: Boxes,
    title: "Re-skinnable",
    description:
      "One starter, many verticals — healthcare, logistics, finance, CRM, ERP.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-16 items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-2 font-semibold">
          <span className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <Boxes className="h-5 w-5 text-white" />
          </span>
          Nexus Ops
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-20 text-center lg:py-28">
          <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
            Enterprise SaaS dashboard demo &amp; starter template
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            The secure, accessible foundation for modern business software.
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            Nexus Ops shows how a production-grade Business Operations Platform should be
            built — security-first, observable, and accessible from day one.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/login">
                Explore the demo <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">Create account</Link>
            </Button>
          </div>
          <p className="text-muted-foreground mt-3 text-xs">
            Demo mode — sign in as Admin, Manager, User, or Viewer (password:{" "}
            <code>password</code>).
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-card rounded-xl border p-6">
                  <span className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="text-muted-foreground border-t px-6 py-6 text-center text-sm">
        Nexus Ops · Enterprise SaaS starter template · Demo environment
      </footer>
    </div>
  );
}
