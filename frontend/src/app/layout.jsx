import { Inter, Roboto_Mono } from 'next/font/google'; // Changed Geist_Mono to Roboto_Mono, and 'Inter as Geist' to 'Inter'
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { EmailProvider } from "@/context/email-context"
import { EmailComposer } from "@/components/email/email-composer"

const fontInter = Inter({ // Renamed from geistSans to fontInter
  variable: '--font-inter', // Changed variable name to --font-inter
  subsets: ['latin'],
});

const fontRobotoMono = Roboto_Mono({ // Replaced geistMono with fontRobotoMono and used Roboto_Mono
  variable: '--font-roboto-mono', // Changed variable name to --font-roboto-mono
  subsets: ['latin'],
});

export const metadata = {
  title: 'HRMS Portal',
  description: 'Human Resource Management System for PESU Venture Labs',
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${fontInter.variable} ${fontRobotoMono.variable} font-sans antialiased`} // Updated font variables
        suppressHydrationWarning // Added suppressHydrationWarning to body
      >
        <EmailProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <EmailComposer />
            <Toaster />
          </ThemeProvider>
        </EmailProvider>
      </body>
    </html>
  );
}

