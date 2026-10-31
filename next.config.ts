import type { NextConfig } from 'next';
const pages = process.env.BUILD_TARGET === 'pages';
const config: NextConfig = {
  ...(pages ? { output: 'export', basePath: '/nextjs-ai-support-assistant' } : {}),
  trailingSlash: true,
  pageExtensions: pages ? ['tsx'] : ['tsx', 'ts'],
};
export default config;
