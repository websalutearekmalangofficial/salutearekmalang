import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getPageContent } from "@/lib/cms.functions";
import { resolveIcon, type Section, type SectionItem } from "@/lib/cms";
import { Building2, Menu, X, ArrowLeft, ArrowRight, CheckCircle2, MessageCircle, Quote, Sparkles } from "lucide-react";
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
    if (!content.page) throw notFound();
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
          <Link to="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label="Sentra Layanan UT Beranda">
            <div className="grid size-10 shrink-0 place-items-center rounded-full border border-hero-foreground/70 bg-hero-foreground/10 sm:size-11 md:size-12">
              <Building2 className="size-6 sm:size-7" aria-hidden="true" />
            </div>
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <div className="min-w-0 leading-none">
                <p className="truncate text-xs font-black uppercase sm:text-sm md:text-base">UNIVERSITAS</p>
                <p className="truncate text-xs font-black uppercase sm:text-sm md:text-base">TERBUKA</p>
              </div>
              <span className="hidden h-10 w-px shrink-0 bg-hero-foreground/70 sm:block" aria-hidden="true" />
              <div className="hidden min-w-0 font-script text-2xl font-bold leading-none text-hero-foreground drop-shadow-title sm:block md:text-4xl">
                Sentra Layanan
                <span className="block font-display text-xl font-black tracking-normal md:text-2xl">UT</span>
              </div>
            </div>
          </Link>

          <nav className="hidden items-center justify-center gap-3 md:flex lg:gap-9" aria-label="Navigasi utama">
            <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-ut-yellow px-4 py-2.5 text-sm font-black text-ut-navy shadow-yellow lg:px-5">Beranda</Link>
            {nav.map((link) => (
              <Link key={link.id} to={link.href.startsWith("/") ? link.href : `/${link.href}`} className="text-sm font-bold tracking-wide text-hero-foreground/90 transition hover:text-ut-yellow lg:text-base">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end md:hidden">
            <button type="button" className="-m-2.5 inline-flex items-center justify-center rounded-xl p-2.5 text-hero-foreground focus:outline-none focus:ring-2 focus:ring-ut-yellow/50" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>
              <span className="sr-only">{menuOpen ? "Tutup menu" : "Buka menu"}</span>
              {menuOpen ? <X className="size-6 sm:size-7" aria-hidden="true" /> : <Menu className="size-6 sm:size-7" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-ut-sky/20 bg-hero-nav md:hidden">
            <nav className="flex flex-col space-y-2 px-4 pb-6 pt-4 sm:px-6">
              <Link to="/" onClick={() => setMenuOpen(false)} className="inline-flex items-center gap-2 rounded-xl bg-ut-yellow/10 px-4 py-3 text-base font-black text-ut-yellow">Beranda</Link>
              {nav.map((link) => (
                <Link key={link.id} to={link.href.startsWith("/") ? link.href : `/${link.href}`} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-base font-bold text-hero-foreground hover:bg-white/5">{link.label}</Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {sections.length === 0 ? (
        <section className="px-4 py-20 text-center"><h1 className="text-3xl font-bold">{page.title}</h1><p className="mt-4 text-muted-foreground">Halaman ini belum memiliki konten.</p></section>
      ) : (
        <div className="pb-24">{sections.map((section) => <SectionRenderer key={section.id} section={section} />)}</div>
      )}
    </main>
  );
}

function SectionRenderer({ section }: { section: Section }) {
  if (section.kind === "hero") {
    return (
      <section className="relative overflow-hidden bg-hero-deep px-4 py-20 text-center text-hero-foreground sm:px-6 lg:px-8 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--ut-sky)/0.24),transparent_55%)]" />
        <div className="relative mx-auto max-w-4xl">
          {section.eyebrow && <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-ut-yellow">{section.eyebrow}</p>}
          <h1 className="text-4xl font-display font-black leading-tight sm:text-5xl md:text-6xl lg:text-7xl">{section.title}</h1>
          {section.subtitle && <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-hero-foreground/80 sm:text-xl">{section.subtitle}</p>}
          {section.link_url && (
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to={section.link_url} className="inline-flex items-center justify-center gap-2 rounded-full bg-ut-yellow px-6 py-3.5 font-black text-ut-navy shadow-yellow transition hover:-translate-y-0.5">{section.link_label || "Mulai Sekarang"}<ArrowRight className="size-5" /></Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (section.kind === "benefits") {
    return (
      <section className="bg-section-blue px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          {section.title && <div className="mx-auto max-w-3xl text-center"><p className="text-sm font-black uppercase tracking-[0.16em] text-ut-blue">SALUT AREK MALANG</p><h2 className="mt-2 text-3xl font-display font-black text-ut-navy sm:text-4xl">{section.title}</h2>{section.subtitle && <p className="mt-4 text-muted-foreground">{section.subtitle}</p>}</div>}
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {section.items?.map((item: SectionItem, index) => {
              const Icon = resolveIcon(item.icon) || Sparkles;
              return (
                <Card key={item.id} className="group h-full rounded-3xl border-none bg-card shadow-benefit transition duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <CardHeader className="p-6 pb-3">
                    <div className="mb-5 flex items-center justify-between"><div className="grid size-12 place-items-center rounded-2xl bg-ut-yellow text-ut-navy shadow-yellow"><Icon className="size-6" /></div><span className="text-sm font-black text-muted-foreground/50">0{index + 1}</span></div>
                    <CardTitle className="text-xl font-black leading-snug">{item.title}</CardTitle>
                  </CardHeader>
                  {item.body && <CardContent className="p-6 pt-1 text-sm leading-relaxed text-muted-foreground"><p>{item.body}</p></CardContent>}
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (section.kind === "richtext") {
    return (
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-border bg-card p-7 shadow-sm sm:p-10 lg:p-14">
          {section.title && <h2 className="text-3xl font-display font-black text-ut-navy sm:text-4xl">{section.title}</h2>}
          {section.body && <div className="prose prose-lg mt-6 max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-ut-blue" dangerouslySetInnerHTML={{ __html: section.body }} />}
          {section.link_url && <Link to={section.link_url} className="mt-8 inline-flex items-center gap-2 font-black text-ut-blue hover:text-ut-navy">{section.link_label || "Pelajari lebih lanjut"}<ArrowRight className="size-4" /></Link>}
        </div>
      </section>
    );
  }

  if (section.kind === "process") {
    return (
      <section className="relative overflow-hidden bg-background px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center"><p className="text-sm font-black uppercase tracking-[0.16em] text-ut-blue">LANGKAH DEMI LANGKAH</p><h2 className="mt-2 text-3xl font-display font-black text-ut-navy sm:text-4xl">{section.title}</h2>{section.subtitle && <p className="mt-4 text-muted-foreground">{section.subtitle}</p>}</div>
          <div className="relative mt-12 grid gap-5 md:grid-cols-5">
            <div className="absolute left-[10%] right-[10%] top-9 hidden h-px bg-border md:block" aria-hidden="true" />
            {section.items?.map((item: SectionItem, index) => {
              const Icon = resolveIcon(item.icon) || CheckCircle2;
              return (
                <div key={item.id} className="relative text-center">
                  <div className="relative z-10 mx-auto grid size-[4.5rem] place-items-center rounded-full border-4 border-background bg-ut-navy text-ut-yellow shadow-lg"><Icon className="size-7" /></div>
                  <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-widest text-ut-blue">Langkah {index + 1}</p><h3 className="mt-2 font-black text-ut-navy">{item.title}</h3>{item.body && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (section.kind === "testimonials") {
    return (
      <section className="bg-muted/40 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl"><div className="mx-auto max-w-3xl text-center"><p className="text-sm font-black uppercase tracking-[0.16em] text-ut-blue">PENGALAMAN NYATA</p><h2 className="mt-2 text-3xl font-display font-black text-ut-navy sm:text-4xl">{section.title}</h2></div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">{section.items?.map((item: SectionItem) => <Card key={item.id} className="rounded-3xl border-none shadow-sm"><CardContent className="p-7"><Quote className="size-8 text-ut-yellow" fill="currentColor" /><p className="mt-5 text-base leading-relaxed text-foreground">{item.body || item.subtitle}</p><div className="mt-6 border-t pt-4"><p className="font-black text-ut-navy">{item.title}</p>{item.subtitle && item.body && <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p>}</div></CardContent></Card>)}</div>
        </div>
      </section>
    );
  }

  if (section.kind === "faq") {
    return (
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl">{section.title && <div className="mb-8 text-center"><p className="text-sm font-black uppercase tracking-[0.16em] text-ut-blue">FAQ</p><h2 className="mt-2 text-3xl font-display font-black text-ut-navy sm:text-4xl">{section.title}</h2></div>}
          <Accordion type="single" collapsible className="space-y-4">{section.items?.map((item: SectionItem) => <AccordionItem key={item.id} value={item.id} className="rounded-2xl border border-border bg-card px-5 shadow-sm"><AccordionTrigger className="text-left font-bold text-foreground hover:no-underline">{item.title}</AccordionTrigger><AccordionContent className="leading-relaxed text-muted-foreground">{item.body}</AccordionContent></AccordionItem>)}</Accordion>
        </div>
      </section>
    );
  }

  if (section.kind === "contact_banner") {
    return (
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-hero-deep px-6 py-12 text-center text-hero-foreground shadow-xl sm:px-10 lg:py-14">
          <div className="mx-auto max-w-3xl"><div className="mx-auto grid size-14 place-items-center rounded-full bg-ut-yellow text-ut-navy shadow-yellow"><MessageCircle className="size-7" /></div><h2 className="mt-5 text-3xl font-display font-black sm:text-4xl">{section.title}</h2>{section.subtitle && <p className="mt-3 text-hero-foreground/75">{section.subtitle}</p>}{section.body && <p className="mt-4 text-2xl font-black text-ut-yellow">{section.body}</p>}{section.link_url && <Link to={section.link_url} className="mt-7 inline-flex items-center gap-2 rounded-full bg-ut-yellow px-7 py-3.5 font-black text-ut-navy shadow-yellow transition hover:-translate-y-0.5">{section.link_label || "Konsultasi Sekarang"}<ArrowRight className="size-5" /></Link>}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">{section.title && <h2 className="mb-6 text-3xl font-display font-bold text-ut-navy">{section.title}</h2>}<div className="grid gap-6 sm:grid-cols-2">{section.items?.map((item: SectionItem) => <div key={item.id} className="rounded-xl border border-border bg-card p-6"><h3 className="text-xl font-bold">{item.title}</h3><p className="mt-2 text-muted-foreground">{item.body}</p></div>)}</div></div></section>
  );
}
