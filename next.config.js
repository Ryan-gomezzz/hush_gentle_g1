/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['localhost', 'PlaceYourSupabaseProjectURLHere.supabase.co'],
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    // Optimize bundle size
    experimental: {
        optimizePackageImports: ['lucide-react', 'recharts'],
    },
    // Compress responses
    compress: true,
};

module.exports = nextConfig;
