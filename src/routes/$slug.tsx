import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getPageContent } from "@/lib/cms.functions";
import { resolveIcon, type Section, type SectionItem } from "@/lib/cms";
import { Building2, Menu, X, ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    const content = await getPageContent({ data: { slug: params.slug } });
    if (!content.page) {
      throw notFound();
    }
    return content;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.page) return { meta: [{ title: "Halaman Tidak Ditemukan" }] };
    return {
      meta: [
        { title: loaderData.page.meta_title || loaderData.page.title },
        { name: "description", content: loaderData.page.meta_description || "" },
      ],
    };
  },
  component: CmsPage,
});

function CmsPage() {
  const { page, sections, nav } = Route.useLoaderData();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!page) return null;

  return (
    <main className="min-h-screen overflow-hidden bg-background font-body text-foreground">
      <header className="sticky top-0 z-40 border-b border-ut-sky/25 bg-hero-nav text-hero-foreground shadow-header">
        <div className="mx-auto grid min-h-16 w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-2.5 sm:gap-3 sm:py-3 md:min-h-20 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:px-8 lg:px-12">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2.5 sm:gap-3"
            aria-label="Sentra Layanan UT Beranda"
          >
            <div className="grid size-10 shrink-0 place-items-center rounded-full border border-hero-foreground/70 bg-hero-foreground/10 sm:size-11 md:size-12">
              <Building2 className="size-6 sm:size-7" aria-hidden="true" />
            </div>
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <div className="min-w-0 leading-none">
                <p className="truncate text-xs font-black uppercase sm:text-sm md:text-base">
                  UNIVERSITAS
                </p>
                <p className="truncate text-xs font-black uppercase sm:text-sm md:text-base">
                  TERBUKA
                </p>
              </div>
              <span
                className="hidden h-10 w-px shrink-0 bg-hero-foreground/70 sm:block"
                aria-hidden="true"
              />
              <div className="hidden min-w-0 font-script text-2xl font-bold leading-none text-hero-foreground drop-shadow-title sm:block md:text-4xl">
                Sentra Layanan
                <span className="block font-display text-xl font-black tracking-normal md:text-2xl">
                  UT
                </span>
              </div>
            </div>
          </Link>

          <nav
            className="hidden items-center justify-center gap-3 md:flex lg:gap-9"
            aria-label="Navigasi utama"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-ut-yellow px-4 py-2.5 text-sm font-black text-ut-navy shadow-yellow lg:px-5"
            >
              Beranda
            </Link>
            {nav.map((link) => (
              <Link
                key={link.id}
                to={link.href.startsWith("/") ? link.href : `/${link.href}`}
                className="text-sm font-bold tracking-wide text-hero-foreground/90 transition hover:text-ut-yellow lg:text-base"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end md:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-xl p-2.5 text-hero-foreground focus:outline-none focus:ring-2 focus:ring-ut-yellow/50"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
            >
              <span className="sr-only">{menuOpen ? "Tutup menu" : "Buka menu"}</span>
              {menuOpen ? (
                <X className="size-6 sm:size-7" aria-hidden="true" />
              ) : (
                <Menu className="size-6 sm:size-7" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-ut-sky/20 bg-hero-nav md:hidden">
            <nav className="flex flex-col space-y-2 px-4 pb-6 pt-4 sm:px-6">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-2 rounded-xl bg-ut-yellow/10 px-4 py-3 text-base font-black text-ut-yellow"
              >
                Beranda
              </Link>
              {nav.map((link) => (
                <Link
                  key={link.id}
                  to={link.href.startsWith("/") ? link.href : `/${link.href}`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-bold text-hero-foreground hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {sections.length === 0 ? (
        <section className="px-4 py-20 text-center">
          <h1 className="text-3xl font-bold">{page.title}</h1>
          <p className="mt-4 text-muted-foreground">Halaman ini belum memiliki konten.</p>
        </section>
      ) : (
        <div className="pb-24">
          {sections.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))}
        </div>
      )}
    </main>
  );
}

function SectionRenderer({ section }: { section: Section }) {
  if (section.kind === "hero") {
    return (
      <section className="bg-hero-deep px-4 py-16 text-center text-hero-foreground sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {section.eyebrow && (
            <p className="text-sm font-bold uppercase tracking-widest text-ut-yellow">
              {section.eyebrow}
            </p>
          )}
          <h1 className="mt-2 text-4xl font-display font-black sm:text-5xl md:text-6xl">
            {section.title}
          </h1>
          {section.subtitle && (
            <p className="mt-4 text-lg text-hero-foreground/80 sm:text-xl">{section.subtitle}</p>
          )}
        </div>
      </section>
    );
  }

  if (section.kind === "richtext") {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {section.title && (
          <h2 className="mb-6 text-3xl font-display font-bold text-ut-navy">{section.title}</h2>
        )}
        {section.body && (
          <div
            className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-ut-blue"
            dangerouslySetInnerHTML={{ __html: section.body }}
          />
        )}
      </section>
    );
  }

  if (section.kind === "benefits") {
    return (
      <section className="bg-section-blue px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {section.title && (
            <h2 className="text-center text-3xl font-display font-bold text-ut-navy">
              {section.title}
            </h2>
          )}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {section.items?.map((item: Section) => {
              const Icon = resolveIcon(item.icon);
              return (
                <Card
                  key={item.id}
                  className="shadow-benefit transition hover:-translate-y-1 rounded-2xl overflow-hidden border-none"
                >
                  <CardHeader className="p-6 pb-2">
                    {Icon && (
                      <div className="mb-4 inline-flex size-14 items-center justify-center rounded-full bg-ut-yellow text-ut-navy shadow-yellow">
                        <Icon className="size-7" />
                      </div>
                    )}
                    <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
                  </CardHeader>
                  {item.body && (
                    <CardContent className="p-6 pt-0 text-muted-foreground">
                      <p>{item.body}</p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (section.kind === "faq") {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {section.title && (
          <h2 className="mb-8 text-center text-3xl font-display font-bold text-ut-navy">
            {section.title}
          </h2>
        )}
        <Accordion type="single" collapsible className="space-y-4">
          {section.items?.map((item: Section) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="rounded-xl border border-border bg-card px-4 shadow-sm"
            >
              <AccordionTrigger className="font-semibold text-foreground hover:no-underline">
                {item.title}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>{item.body}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    );
  }

  // Fallback for other section types like process, testimonials, etc.
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {section.title && (
          <h2 className="mb-6 text-3xl font-display font-bold text-ut-navy">{section.title}</h2>
        )}
        <div className="grid gap-6 sm:grid-cols-2">
          {section.items?.map((item: Section) => (
            <div key={item.id} className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="mt-2 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChevronDown(props: Section) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
