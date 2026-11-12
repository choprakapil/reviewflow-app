import { describe, it, expect } from "vitest";
import { getDailyKeyedSalt, pseudonymizeIp } from "@/lib/analytics-crypto";
import { extractClientIp } from "@/lib/rate-limit";

describe("Analytics Privacy & Telemetry Hardening Suite", () => {
  describe("Daily Keyed Salt & Pseudonymization", () => {
    it("generates different salt hashes across different UTC dates", () => {
      const saltDay1 = getDailyKeyedSalt("2026-11-12");
      const saltDay2 = getDailyKeyedSalt("2026-11-13");

      expect(saltDay1).not.toBe(saltDay2);
      expect(saltDay1.length).toBe(64); // SHA-256 hex
    });

    it("produces deterministic pseudonymized hash for same IP on the same day", () => {
      const day = "2026-11-12";
      const salt = getDailyKeyedSalt(day);
      const ip = "203.0.113.195";

      const hash1 = pseudonymizeIp(ip, salt);
      const hash2 = pseudonymizeIp(ip, salt);

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(32);
    });

    it("prevents cross-day consumer tracking by producing different hashes for same IP on different days", () => {
      const ip = "203.0.113.195";
      const saltDay1 = getDailyKeyedSalt("2026-11-12");
      const saltDay2 = getDailyKeyedSalt("2026-11-13");

      const hashDay1 = pseudonymizeIp(ip, saltDay1);
      const hashDay2 = pseudonymizeIp(ip, saltDay2);

      expect(hashDay1).not.toBe(hashDay2);
    });
  });

  describe("Trusted Proxy IP Extraction & Spoofing Defense", () => {
    it("extracts trusted Cloudflare CF-Connecting-IP header first", () => {
      const headers = new Headers({
        "cf-connecting-ip": "198.51.100.42",
        "x-forwarded-for": "10.0.0.1, 10.0.0.2",
      });

      const ip = extractClientIp(headers);
      expect(ip).toBe("198.51.100.42");
    });

    it("extracts trusted X-Real-IP header when CF header is absent", () => {
      const headers = new Headers({
        "x-real-ip": "198.51.100.88",
        "x-forwarded-for": "spoofed-text, 10.0.0.1",
      });

      const ip = extractClientIp(headers);
      expect(ip).toBe("198.51.100.88");
    });

    it("sanitizes X-Forwarded-For and filters out spoofed non-IP strings", () => {
      const headers = new Headers({
        "x-forwarded-for": "invalid-ip-payload, 203.0.113.50, 192.168.1.1",
      });

      const ip = extractClientIp(headers);
      expect(ip).toBe("203.0.113.50");
    });

    it("strips port numbers from client IP addresses", () => {
      const headers = new Headers({
        "x-forwarded-for": "203.0.113.75:8080",
      });

      const ip = extractClientIp(headers);
      expect(ip).toBe("203.0.113.75");
    });

    it("falls back safely to loopback 127.0.0.1 when no valid IP header is provided", () => {
      const headers = new Headers({
        "x-forwarded-for": "malicious-script-tag-<script>",
      });

      const ip = extractClientIp(headers);
      expect(ip).toBe("127.0.0.1");
    });
  });
});
