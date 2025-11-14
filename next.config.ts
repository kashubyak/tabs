import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	output: 'export',
	basePath: '/tabs',
	images: {
		unoptimized: true,
	},
}

export default nextConfig
