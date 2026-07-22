/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    // Bỏ qua lỗi TypeScript khi dev/demo, bật lại kiểm tra nghiêm ngặt khi deploy production
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  images: {
    // Tắt tối ưu hóa hình ảnh trong môi trường dev/demo, tối ưu hóa đầy đủ ở production
    unoptimized: process.env.NODE_ENV === 'development',
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'framer-motion',
      '@radix-ui/react-icons'
    ]
  }
}

export default nextConfig
