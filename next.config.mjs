/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bundle the protected HTML documents into the serverless functions that serve them.
  outputFileTracingIncludes: {
    "/brand-identity-system": ["./content/**"],
    "/operational-philosophy": ["./content/**"],
    "/doctrine": ["./content/**"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:;" },
        ],
      },
    ];
  },
};
export default nextConfig;
