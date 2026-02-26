import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false, // Kullanıcı giriş yapınca geri dönebilsin diye false
      },
    ];
  },
};

export default nextConfig;