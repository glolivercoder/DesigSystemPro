/**
 * SEO Engine & Structured Data Generator
 * Implements high-impact search engine optimization, OpenGraph for Facebook & Instagram,
 * Twitter Cards, and schema.org JSON-LD structured data.
 */

export interface SeoInput {
  title: string;
  description: string;
  url: string;
  siteName: string;
  imageUrl?: string;
  categoryName: string;
  keywords?: string[];
  product?: {
    name: string;
    price: number | string;
    currency: string;
    sku?: string;
    brand: string;
    inStock: boolean;
    rating?: number;
    reviewCount?: number;
  };
  faqs?: { question: string; answer: string }[];
}

export interface SeoOutput {
  metaTitle: string;
  metaDescription: string;
  canonical: string;
  robots: string;
  openGraph: Record<string, string>;
  twitterCard: Record<string, string>;
  jsonLdProduct: Record<string, unknown> | null;
  jsonLdOrganization: Record<string, unknown>;
  jsonLdFaq: Record<string, unknown> | null;
  serpSnippet: {
    googleTitle: string;
    googleUrl: string;
    googleSnippet: string;
  };
  socialCard: {
    title: string;
    description: string;
    domain: string;
    image: string;
  };
}

export function generateSeoMetadata(input: SeoInput): SeoOutput {
  const brand = input.siteName || "Atelier Studio";
  
  // Format title to optimal 50-60 char length
  let metaTitle = input.title.trim();
  if (!metaTitle.includes(brand)) {
    metaTitle = `${metaTitle} | ${brand}`;
  }
  if (metaTitle.length > 60) {
    metaTitle = metaTitle.slice(0, 57) + "…";
  }

  // Format meta description to optimal 145-160 char length
  let metaDesc = input.description.trim();
  if (metaDesc.length > 158) {
    metaDesc = metaDesc.slice(0, 155) + "…";
  }

  const cleanUrl = input.url || "https://sua-empresa.com.br";
  const ogImage = input.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=630&fit=crop";

  // OpenGraph tags (Used by Facebook, Instagram, WhatsApp, LinkedIn)
  const openGraph: Record<string, string> = {
    "og:type": input.product ? "product" : "website",
    "og:site_name": brand,
    "og:title": metaTitle,
    "og:description": metaDesc,
    "og:url": cleanUrl,
    "og:image": ogImage,
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:locale": "pt_BR",
  };

  // Twitter / X card tags
  const twitterCard: Record<string, string> = {
    "twitter:card": "summary_large_image",
    "twitter:title": metaTitle,
    "twitter:description": metaDesc,
    "twitter:image": ogImage,
  };

  // JSON-LD Product Schema
  let jsonLdProduct: Record<string, unknown> | null = null;
  if (input.product) {
    const rawPrice = typeof input.product.price === "string" 
      ? parseFloat(input.product.price.replace(/[^0-9.]/g, "")) || 199 
      : input.product.price;

    jsonLdProduct = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: input.product.name,
      image: [ogImage],
      description: metaDesc,
      brand: {
        "@type": "Brand",
        name: input.product.brand || brand,
      },
      offers: {
        "@type": "Offer",
        url: cleanUrl,
        priceCurrency: input.product.currency || "BRL",
        price: rawPrice.toFixed(2),
        priceValidUntil: "2027-12-31",
        itemCondition: "https://schema.org/NewCondition",
        availability: input.product.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: input.product.rating || 4.9,
        reviewCount: input.product.reviewCount || 42,
      },
    };
  }

  // JSON-LD Organization Schema
  const jsonLdOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand,
    url: cleanUrl,
    logo: ogImage,
    sameAs: [
      "https://instagram.com/" + brand.toLowerCase().replace(/\s+/g, ""),
      "https://facebook.com/" + brand.toLowerCase().replace(/\s+/g, ""),
    ],
  };

  // JSON-LD FAQ Schema
  let jsonLdFaq: Record<string, unknown> | null = null;
  if (input.faqs && input.faqs.length > 0) {
    jsonLdFaq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: input.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
  }

  // SERP Previews
  let domain = "sua-empresa.com.br";
  try {
    domain = new URL(cleanUrl).hostname;
  } catch {}

  return {
    metaTitle,
    metaDescription: metaDesc,
    canonical: cleanUrl,
    robots: "index, follow, max-image-preview:large",
    openGraph,
    twitterCard,
    jsonLdProduct,
    jsonLdOrganization,
    jsonLdFaq,
    serpSnippet: {
      googleTitle: metaTitle,
      googleUrl: `https://${domain} › ${input.categoryName.toLowerCase().replace(/\s+/g, "-")}`,
      googleSnippet: metaDesc,
    },
    socialCard: {
      title: metaTitle,
      description: metaDesc,
      domain: domain.toUpperCase(),
      image: ogImage,
    },
  };
}

/** Formats HTML meta tags as a clean string ready to paste into <head> */
export function formatHtmlHeadTags(seo: SeoOutput): string {
  const ogLines = Object.entries(seo.openGraph)
    .map(([key, val]) => `  <meta property="${key}" content="${val}" />`)
    .join("\n");

  const twLines = Object.entries(seo.twitterCard)
    .map(([key, val]) => `  <meta name="${key}" content="${val}" />`)
    .join("\n");

  const jsonLdScripts: string[] = [];
  if (seo.jsonLdProduct) {
    jsonLdScripts.push(`  <script type="application/ld+json">\n  ${JSON.stringify(seo.jsonLdProduct, null, 2)}\n  </script>`);
  }
  jsonLdScripts.push(`  <script type="application/ld+json">\n  ${JSON.stringify(seo.jsonLdOrganization, null, 2)}\n  </script>`);
  if (seo.jsonLdFaq) {
    jsonLdScripts.push(`  <script type="application/ld+json">\n  ${JSON.stringify(seo.jsonLdFaq, null, 2)}\n  </script>`);
  }

  return `<!-- SEO & Metadados Primários -->
  <title>${seo.metaTitle}</title>
  <meta name="description" content="${seo.metaDescription}" />
  <link rel="canonical" href="${seo.canonical}" />
  <meta name="robots" content="${seo.robots}" />

<!-- OpenGraph (Facebook, Instagram, WhatsApp) -->
${ogLines}

<!-- Twitter Cards -->
${twLines}

<!-- Dados Estruturados (Google Rich Results / JSON-LD) -->
${jsonLdScripts.join("\n")}`;
}

