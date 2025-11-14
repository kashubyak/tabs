import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	output: 'export',
	basePath: '/repo-name',
	images: {
		unoptimized: true,
	},
}

export default nextConfig
