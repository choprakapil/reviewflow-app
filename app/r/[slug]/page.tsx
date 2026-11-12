import { notFound } from "next/navigation";
import { BusinessService } from "@/services/business.service";
import { CustomerCard } from "@/components/public/customer-card";
import { ExternalLink, PauseCircle } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const business = await BusinessService.getBusinessBySlug(slug);
    return {
      title: `Review ${business.name} on Google`,
      description: `Share your verified customer review for ${business.name}.`,
    };
  } catch {
    return {
      title: "Google Review Assistant",
    };
  }
}

export default async function PublicReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let business;
  try {
    business = await BusinessService.getBusinessBySlug(slug);
  } catch {
    notFound();
  }

  // Handle Paused / Inactive Campaign
  if (business.status !== "ACTIVE" || !business.qrCode?.isActive) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
            <PauseCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            {business.name}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This establishment&apos;s review portal is currently paused. You can still visit their official Google page directly:
          </p>
          <a
            href={business.googleReviewUrl}
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-sm"
          >
            <span>Open Google Reviews</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4 flex flex-col justify-between">
      <CustomerCard
        businessName={business.name}
        category={business.category}
        address={business.address}
        googleReviewUrl={business.googleReviewUrl}
        businessSlug={business.slug}
        initialSuggestions={business.suggestions.map((s) => ({
          id: s.id,
          suggestionText: s.suggestionText,
          targetedService: s.targetedService,
        }))}
      />

      <footer className="py-4 text-center text-[10px] text-zinc-400">
        Powered by ReviewFlow Engine
      </footer>
    </main>
  );
}

