import { Link } from "react-router-dom";
import mainLogo from "@/assets/Ancientika_logo_mocha_brown.png";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 glass-dark text-primary-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* The Company */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] mb-4 opacity-90">The Company</h4>
            <ul className="space-y-2">
              {[
                { label: "About", href: "/about" },
                { label: "Shop", href: "/shop" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-xs uppercase tracking-[0.1em] opacity-90 hover:opacity-100 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Assistance */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] mb-4 opacity-90">Assistance</h4>
            <ul className="space-y-2">
              {[
                { label: "Contact Us", href: "/contact" },
                { label: "Size Guide", href: "/size-guide" },
                { label: "Product Care", href: "/product-care" },
                { label: "Delivery Information", href: "#" },
                { label: "Return & Refunds", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-xs uppercase tracking-[0.1em] opacity-80 hover:opacity-100 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] mb-4 opacity-70">Legal</h4>
            <ul className="space-y-2">
              {[
                "Privacy Policy",
                "Terms & Conditions",
              ].map((label) => (
                <li key={label}>
                  <Link
                    to="#"
                    className="text-xs uppercase tracking-[0.1em] opacity-80 hover:opacity-100 transition-opacity"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] mb-4 opacity-70">Follow Us</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.instagram.com/ancientika/?utm_source=ig_web_button_share_sheet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-[0.1em] opacity-80 hover:opacity-100 transition-opacity"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@ancientika?_r=1&_t=ZS-93vY16bppCL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-[0.1em] opacity-80 hover:opacity-100 transition-opacity"
                >
                  TikTok
                </a>
              </li>
              <li>
                <Link
                  to="/#newsletter"
                  className="text-xs uppercase tracking-[0.1em] opacity-80 hover:opacity-100 transition-opacity"
                >
                  Subscribe
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-primary-foreground/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <img src={mainLogo} alt="Ancientika" className="h-10 brightness-0 invert opacity-70" />
          <p className="text-xs opacity-50">
            © {new Date().getFullYear()} ancientika. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
