/** @type {import('next').NextConfig} */
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("@next/env").loadEnvConfig(process.cwd());
} catch {}

const basePath = process.env.NEXT_BASE_PATH ? process.env.NEXT_BASE_PATH.replace(/\/$/, '') : undefined;

const nextConfig = {
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath || '',
  },
  ...(basePath ? { basePath } : {}),
  reactStrictMode: true,
  poweredByHeader: false,
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
  ],
};

module.exports = nextConfig;




