import "../global.css";
import { Geist, Geist_Mono } from "next/font/google";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hotel reservation",
  description: "Book your perfect stay with us",
};

export default function AdminLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >


      <body>
  
        {children}

        {/* jQuery */}
       
      </body>
    </html>
  );
}