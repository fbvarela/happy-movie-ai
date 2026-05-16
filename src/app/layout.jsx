import "@neondatabase/auth/ui/css";
import "./globals.css";
import Providers from "@/components/Providers";
import Script from "next/script";
import FloatingChatButton from "@/components/FloatingChatButton";

export const metadata = {
  title: "HappyMovie - AI Movie Companion",
  description: "Discover, explore, and get AI-powered movie recommendations",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HappyMovie",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#3d2b1f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <Script id="theme-init" strategy="beforeInteractive">{`(function(){try{var t=localStorage.getItem('theme')||'system';if(t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`}</Script>
      </head>
      <body suppressHydrationWarning>
        <Script id="pwa-prompt-capture" strategy="beforeInteractive">{`
          window.__pwaInstallPrompt = null;
          window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            window.__pwaInstallPrompt = e;
          });
        `}</Script>
        <Providers>
          {children}
        </Providers>
        <FloatingChatButton />
      </body>
    </html>
  );
}
