import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThemeCycle } from "@/components/theme-cycle";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: 'ML Algorithm Simulator | Interactive Machine Learning',
  description: 'Learn machine learning algorithms through interactive visualizations. Explore Linear Regression, K-Means Clustering, and Decision Trees step-by-step.',
  generator: 'v0.app',
  // Icons removed to hide favicon/logo from the site
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                // Restore dark/light mode
                const theme = localStorage.getItem('theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
                
                // Restore color theme
                const uiTheme = localStorage.getItem('ui-theme');
                if (uiTheme) {
                  document.documentElement.setAttribute('data-theme', uiTheme);
                }
              } catch (e) {}
            })();
          `
        }} />
      </head>
      <body className={`${spaceGrotesk.variable} ${jetBrainsMono.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <ThemeCycle />
        <Analytics />
      </body>
    </html>
  )
}
