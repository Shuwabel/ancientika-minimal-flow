import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, ChevronDown } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { collections } from "@/lib/mock-data";
import horizontalLogo from "@/assets/ancientika_logo_and_name_horizontal_2.png";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { totalItems, setIsOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const isShopPage = location.pathname === "/shop";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img src={horizontalLogo} alt="Ancientika" className="h-8" />
        </Link>

        {/* Nav - always visible, context-aware */}
        <nav className="flex items-center gap-6">
          {isShopPage && (
            <Link
              to="/"
              className="text-sm uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
          )}

          {isShopPage ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors outline-none">
                Shop <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="bg-popover">
                <DropdownMenuItem
                  onClick={() => navigate("/shop")}
                  className="text-sm uppercase tracking-[0.1em] cursor-pointer"
                >
                  All
                </DropdownMenuItem>
                {collections.map((col) => (
                  <DropdownMenuItem
                    key={col.slug}
                    onClick={() => navigate(`/shop?category=${col.slug}`)}
                    className="text-sm uppercase tracking-[0.1em] cursor-pointer"
                  >
                    {col.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/shop"
              className="text-sm uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Shop
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link to="/shop" className="p-2 hover:text-accent transition-colors" aria-label="Search">
            <Search className="h-5 w-5" />
          </Link>
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:text-accent transition-colors relative"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
