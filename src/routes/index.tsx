import { createFileRoute } from "@tanstack/react-router";
import { getPageContent } from "@/lib/cms.functions";
import { CmsPageView } from "@/routes/$slug";

export const Route = createFileRoute("/")({
  loader: async () => getPageContent({ data: { slug: "beranda" } }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.page?.meta_title || loaderData?.page?.title || "Sentra Layanan UT Arek Malang",
      },
      {
        name: "description",
        content:
          loaderData?.page?.meta_description ||
          "Landing page resmi Sentra Layanan UT Arek Malang untuk pendaftaran, alur layanan, informasi, dan kontak.",
      },
      {
        property: "og:title",
        content: loaderData?.page?.meta_title || loaderData?.page?.title || "Sentra Layanan UT Arek Malang",
      },
      {
        property: "og:description",
        content:
          loaderData?.page?.meta_description ||
          "Daftar dan dapatkan informasi pendaftaran Universitas Terbuka melalui Sentra Layanan UT Arek Malang.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <CmsPageView content={Route.useLoaderData()} />;
}
