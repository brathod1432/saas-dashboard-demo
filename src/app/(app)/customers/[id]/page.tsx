import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { requirePermission } from "@/lib/auth/server";
import { customersRepository } from "@/lib/api/repositories/customers";
import { projectsRepository } from "@/lib/api/repositories/projects";
import { invoicesRepository } from "@/lib/api/repositories/invoices";
import { findUserById } from "@/lib/auth/users";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/states";
import { formatCurrency, formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const customer = customersRepository.getById(id);
  return { title: customer ? customer.name : "Customer" };
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("customers:view");
  const { id } = await params;
  const customer = customersRepository.getById(id);
  if (!customer) notFound();

  const projects = projectsRepository.byCustomer(id);
  const invoices = invoicesRepository.byCustomer(id);
  const owner = findUserById(customer.ownerId);

  return (
    <div className="space-y-6">
      <Link
        href="/customers"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to customers
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{customer.name}</h1>
          <p className="text-muted-foreground text-sm">
            {customer.industry} · <span className="capitalize">{customer.tier}</span>
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-sm">
            <StatusBadge value={customer.status} />
            <span className="text-muted-foreground inline-flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> {customer.email}
            </span>
            <span className="text-muted-foreground inline-flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" /> {customer.phone}
            </span>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">MRR</p>
            <p className="text-2xl font-semibold">{formatCurrency(customer.mrr)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">Health score</p>
            <p className="text-2xl font-semibold">{customer.healthScore}/100</p>
            <Progress value={customer.healthScore} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">Account owner</p>
            <p className="text-lg font-semibold">{owner?.name ?? "—"}</p>
            <p className="text-muted-foreground text-xs">{owner?.title}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">Customer since</p>
            <p className="text-lg font-semibold">{formatDate(customer.createdAt)}</p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>{projects.length} total</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <EmptyState
                title="No projects"
                description="This customer has no projects yet."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <Link
                          href={`/projects/${project.id}`}
                          className="hover:underline"
                        >
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={project.status} />
                      </TableCell>
                      <TableCell className="w-32">
                        <div className="flex items-center gap-2">
                          <Progress value={project.progress} className="h-1.5" />
                          <span className="text-muted-foreground text-xs">
                            {project.progress}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>{invoices.length} total</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <EmptyState
                title="No invoices"
                description="This customer has no invoices yet."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-xs">
                        {invoice.number}
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={invoice.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
