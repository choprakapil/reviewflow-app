import { describe, it, expect } from "vitest";
import { validateGoogleReviewUrl, constructReviewUrlFromPlaceId } from "@/lib/utils/google-url";

describe("Google Review URL Validation & Construction", () => {
  it("accepts valid search.google.com write review URL with placeid", () => {
    const url = "https://search.google.com/local/writereview?placeid=ChIJd8BlQ2B-j4AR29pQz8WfV0U";
    const result = validateGoogleReviewUrl(url);

    expect(result.isValid).toBe(true);
    expect(result.placeId).toBe("ChIJd8BlQ2B-j4AR29pQz8WfV0U");
  });

  it("accepts valid g.page short review links", () => {
    const url = "https://g.page/r/Cdf_12345/review";
    const result = validateGoogleReviewUrl(url);

    expect(result.isValid).toBe(true);
    expect(result.normalizedUrl).toBe(url);
  });

  it("rejects non-Google malicious URLs (open redirect defense)", () => {
    const maliciousUrl = "https://phishing-site.example.com/login?steal=1";
    const result = validateGoogleReviewUrl(maliciousUrl);

    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Must be an official Google domain");
  });

  it("rejects non-HTTPS URLs", () => {
    const insecure = "http://search.google.com/local/writereview?placeid=123";
    const result = validateGoogleReviewUrl(insecure);

    expect(result.isValid).toBe(false);
    expect(result.error).toContain("must use HTTPS");
  });

  it("constructs direct review URL from placeid", () => {
    const url = constructReviewUrlFromPlaceId("ChIJ123ABC");
    expect(url).toBe("https://search.google.com/local/writereview?placeid=ChIJ123ABC");
  });
});

