import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CLARIVO™ Smart Film | Privacy for existing glass, Queensland",
  description: "Smart film that switches existing glass between clear and private. Enquire about your Queensland project.",
};
export const viewport: Viewport = { themeColor: "#F4F1EA" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en-AU"><body>{children}</body></html>;
}
