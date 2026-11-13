import { notFound } from "next/navigation";
import { BusinessService } from "@/services/business.service";
import { CustomerCard } from "@/components/public/customer-card";
import { ExternalLink, PauseCircle, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-card text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200/60 shadow-subtle">
            <PauseCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {business.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Review Campaign Temporarily Paused</p>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            This establishment&apos;s guided review portal is currently paused. You can still visit their official Google page directly to leave your feedback:
          </p>
          <a
            href={business.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md active:scale-98"
          >
            <span>Open Google Reviews</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 flex flex-col justify-between items-center selection:bg-indigo-100 selection:text-indigo-900">
      <div className="w-full max-w-[460px] my-auto">
        <CustomerCard
          businessName={business.name}
          category={business.category}
          address={business.address}
          googleReviewUrl={business.googleReviewUrl}
          businessSlug={business.slug}
          services={Array.isArray(business.services) ? (business.services as string[]) : []}
          askCustomerQuestions={business.aiConfig?.askCustomerQuestions ?? false}
          initialSuggestions={business.suggestions.map((s) => ({
            id: s.id,
            suggestionText: s.suggestionText,
            targetedService: s.targetedService,
          }))}
        />
      </div>

      <footer className="py-6 text-center text-xs text-slate-400 flex items-center gap-2 justify-center">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
        <span>Powered by ReviewFlow Platform</span>
      </footer>
    </main>
  );
}
