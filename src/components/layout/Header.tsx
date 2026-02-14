import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, Menu, ChevronDown } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { collections } from "@/lib/mock-data";
import horizontalLogo from "@/assets/ancientika_logo_and_name_horizontal_2.png";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";

export default function Header() {
  const { totalItems, setIsOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const isShopPage = location.pathname === "/shop";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  const handleNav = (to: string) => {
    setSidebarOpen(false);
    navigate(to);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Hamburger */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <button className="p-2 hover:text-accent transition-colors" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <nav className="flex flex-col gap-1 mt-8">
              {isShopPage && (
                <button
                  onClick={() => handleNav("/")}
                  className="text-left text-sm uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors py-3 border-b border-border"
                >
                  Home
                </button>
              )}

              {isShopPage ? (
                <div>
                  <button
                    onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                    className="flex items-center justify-between w-full text-left text-sm uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors py-3 border-b border-border"
                  >
                    Shop
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${categoriesExpanded ? "rotate-180" : ""}`} />
                  </button>
                  {categoriesExpanded && (
                    <div className="flex flex-col pl-4">
                      <button
                        onClick={() => handleNav("/shop")}
                        className="text-left text-sm uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors py-2.5"
                      >
                        All
                      </button>
                      {collections.map((col) => (
                        <button
                          key={col.slug}
                          onClick={() => handleNav(`/shop?category=${col.slug}`)}
                          className="text-left text-sm uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors py-2.5"
                        >
                          {col.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleNav("/shop")}
                  className="text-left text-sm uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors py-3 border-b border-border"
                >
                  Shop
                </button>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/">
          <img src={horizontalLogo} alt="Ancientika" className="h-8" />
        </Link>

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
