
import "./globals.css";

import { ThemeProvider } from "../components/ThemeContext";
import NavBarWrapper from "../components/NavBarWrapper";
import FooterWrapper from "../components/FooterWrapper";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <NavBarWrapper />
          <main>{children}</main>
          <FooterWrapper />
        </ThemeProvider>
      </body>
    </html>
  );
}


