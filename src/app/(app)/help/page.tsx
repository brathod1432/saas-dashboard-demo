import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, LifeBuoy, MessageSquare, ShieldCheck, Keyboard } from "lucide-react";
import { requireUser } from "@/lib/auth/server";
import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Help" };

const RESOURCES = [
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Architecture, setup, security model, and customization guides.",
    href: "/showcase",
  },
  {
    icon: ShieldCheck,
    title: "Security & RBAC",
    description: "How roles, permissions, and the audit trail work.",
    href: "/settings",
  },
  {
    icon: MessageSquare,
    title: "Contact support",
    description: "Reach the team for help with your workspace.",
    href: "/help",
  },
];

const FAQS = [
  {
    q: "How do the demo roles work?",
    a: "Sign in as Admin, Manager, User, or Viewer to see how the UI and permissions change. The shared demo password is 'password'.",
  },
  {
    q: "Is the data real?",
    a: "No. All data is seeded in memory and reset on restart. Authentication is simulated — never enter real credentials.",
  },
  {
    q: "How do I connect a real backend?",
    a: "Replace the clients + repositories layer. Hooks, services, and UI are unchanged. See the customization guide.",
  },
  {
    q: "Is it accessible?",
    a: "Yes — WCAG AA is targeted: keyboard navigation, focus management, ARIA, and reduced-motion support are built in.",
  },
];

export default async function HelpPage() {
  await requireUser();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Help & resources"
        description="Guides, FAQs, and support for Nexus Ops."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {RESOURCES.map((resource) => {
          const Icon = resource.icon;
          return (
            <Link key={resource.title} href={resource.href}>
              <Card className="hover:border-primary/40 h-full transition-colors">
                <CardHeader>
                  <span className="bg-primary/10 text-primary mb-2 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Icon className="h-5 w-5" />
                  </span>
                  <CardTitle className="text-base">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" /> Keyboard shortcuts
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between">
            <span>Skip to content</span>
            <kbd className="bg-muted rounded px-1.5 py-0.5 text-xs">Tab</kbd>
          </div>
          <div className="flex justify-between">
            <span>Navigate table headers</span>
            <kbd className="bg-muted rounded px-1.5 py-0.5 text-xs">Enter</kbd>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="h-4 w-4" /> Frequently asked questions
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {FAQS.map((faq) => (
            <div key={faq.q} className="py-3">
              <p className="text-sm font-medium">{faq.q}</p>
              <p className="text-muted-foreground text-sm">{faq.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
