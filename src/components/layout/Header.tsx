import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, Menu, ChevronDown } from "lucide-react";
import UserMenu from "@/components/layout/UserMenu";
import { useCartStore } from "@/stores/cartStore";
import { fetchCollections } from "@/lib/shopify";
import { useQuery } from "@tanstack/react-query";
import mochaLogo from "@/assets/Ancientika_logo_mocha_brown.png";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import PredictiveSearch from "@/components/PredictiveSearch";

export default function Header() {
  const totalItems = useCartStore(s => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const setIsOpen = useCartStore(s => s.setIsOpen);
  
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: collections = [] } = useQuery({
    queryKey: ['shopify-collections'],
    queryFn: () => fetchCollections(10),
  });

  const handleNav = (to: string) => {
    setSidebarOpen(false);
    navigate(to);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center justify-between">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-2">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <button className="p-2 hover:text-accent transition-colors" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-56">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <nav className="flex flex-col gap-1 mt-8">
                  {!isHomePage && (
                    <button onClick={() => handleNav("/")} className="text-left text-sm uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors py-3 border-b border-border">
                      Home
                    </button>
                  )}
                  <div>
                    <button onClick={() => setCategoriesExpanded(!categoriesExpanded)} className="flex items-center justify-between w-full text-left text-sm uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors py-3 border-b border-border">
                      Shop
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${categoriesExpanded ? "rotate-180" : ""}`} />
                    </button>
                    {categoriesExpanded && (
                      <div className="flex flex-col pl-4">
                        <button onClick={() => handleNav("/shop")} className="text-left text-sm uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors py-2.5">All</button>
                        {collections.map((col) => (
                          <button key={col.node.handle} onClick={() => handleNav(`/shop?category=${col.node.handle}`)} className="text-left text-sm uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors py-2.5">
                            {col.node.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleNav("/about")} className="text-left text-sm uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors py-3 border-b border-border">
                    About
                  </button>
                  <button onClick={() => handleNav("/contact")} className="text-left text-sm uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors py-3 border-b border-border">
                    Contact
                  </button>
                </nav>
              </SheetContent>
            </Sheet>

            <Link to="/">
              <span className="text-accent text-xl tracking-wide" style={{ fontFamily: 'PorshaRichela' }}>ancientika</span>
            </Link>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(true)} className="p-2 hover:text-accent transition-colors" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>
            <UserMenu />
            <button onClick={() => setIsOpen(true)} className="p-2 hover:text-accent transition-colors relative" aria-label="Cart">
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
      <PredictiveSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
