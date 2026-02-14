import { Link } from "react-router-dom";
import mainLogo from "@/assets/Ancientika_logo_mocha_brown.png";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2 flex flex-col items-center md:items-start">
            <img src={mainLogo} alt="Ancientika" className="h-16 mb-3" />
            <p className="text-lg font-bold">Premium, defined by less</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] mb-4 text-muted-foreground">Shop</h4>
            <ul className="space-y-2">
              {["Tops", "Bottoms", "Outerwear", "Accessories"].map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/shop?category=${cat.toLowerCase()}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] mb-4 text-muted-foreground">Info</h4>
            <ul className="space-y-2">
              {[
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ancientika. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
