
import { Plus_Jakarta_Sans, Roboto_Mono } from "next/font/google";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserId } from "@/lib/session";

import GuestMenu from "./Guestmenu/guestmenu";
import ClientMenu from "./Clientmenu/clientmenu";
import Footer from "@/components/footer/Footer";

import "./resorts.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export default async function ClientLayout({ children }) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";

  // Read the authenticated user from the server session.
  const userId = await getUserId();

  const GUEST_ONLY_PATHS = ["/", "/login", "/register"];

  const isGuestOnlyPage = GUEST_ONLY_PATHS.includes(pathname);

  // Authenticated users should not visit guest-only pages.
  if (userId && isGuestOnlyPage) {
    redirect("/dashboard");
  }

  // Unauthenticated users cannot access dashboard pages.
  if (!userId && !isGuestOnlyPage) {
    redirect("/login");
  }

  return (
    <div
      className={`${jakartaSans.variable} ${robotoMono.variable} resorts-page`}
    >
      <main>
        {userId ? <ClientMenu /> : <GuestMenu />}
        {children}
      </main>

      <Footer />
    </div>
  );
}
