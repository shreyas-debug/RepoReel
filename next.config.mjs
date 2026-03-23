/** @type {import('next').NextConfig} */
const nextConfig = {
  // When set (e.g. by `npm run build:safe`), output goes here so `next build` does not
  // race with `next dev` on `.next` (which can yield an empty pages-manifest and
  // `Cannot find module for page: /_document`).
  ...(process.env.NEXT_BUILD_DIR ? { distDir: process.env.NEXT_BUILD_DIR } : {}),
};

export default nextConfig;
