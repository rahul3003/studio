
import { Inter, Roboto_Mono } from 'next/font/google'; // Changed Geist_Mono to Roboto_Mono, and 'Inter as Geist' to 'Inter'
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';

const fontInter = Inter({ // Renamed from geistSans to fontInter
  variable: '--font-inter', // Changed variable name to --font-inter
  subsets: ['latin'],
});

const fontRobotoMono = Roboto_Mono({ // Replaced geistMono with fontRobotoMono and used Roboto_Mono
  variable: '--font-roboto-mono', // Changed variable name to --font-roboto-mono
  subsets: ['latin'],
});

export const metadata = {
  title: 'HRMS portal',
  description: 'Human Resource Management System with Role Switching',
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
