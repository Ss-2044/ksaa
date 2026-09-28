import type { Metadata } from "next";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "موجود — بيع وشراء السلع المستعملة والجديدة", template: "%s | موجود" },
  description: "منصة موجود لبيع وشراء الأجهزة المستعملة والجديدة بأمان في السعودية: ضمان ذهبي، أجهزة مفحوصة، دفع آمن وتوصيل سريع.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <DirectionProvider direction="rtl">
          <div className="isolate">{children}</div>
        </DirectionProvider>
      </body>
    </html>
  );
}
