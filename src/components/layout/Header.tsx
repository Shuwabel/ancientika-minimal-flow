import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, Menu, ChevronDown, X } from "lucide-react";

import { useCartStore } from "@/stores/cartStore";
import { fetchCollections } from "@/lib/shopify";
import { useQuery } from "@tanstack/react-query";
import mochaLogo from "@/assets/Ancientika_logo_mocha_brown.png";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState, useRef, useEffect, useCallback } from "react";
import PredictiveSearch from "@/components/PredictiveSearch";
import { AnimatePresence, motion } from "framer-motion";

function ShopDropdown({ collections, navigate }: { collections: any[]; navigate: (to: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
      >
        Shop
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-1 glass-heavy rounded-lg shadow-xl z-50 min-w-[160px] py-1"
          >
            <button
              onClick={() => { setOpen(false); navigate("/shop"); }}
              className="block w-full text-left px-4 py-2.5 text-xs uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              All
            </button>
            {collections.map((col) => (
              <button
                key={col.node.handle}
                onClick={() => { setOpen(false); navigate(`/shop?category=${col.node.handle}`); }}
                className="block w-full text-left px-4 py-2.5 text-xs uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                {col.node.title}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Header() {
  const totalItems = useCartStore(s => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const setIsOpen = useCartStore(s => s.setIsOpen);
  
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Lock body scroll when search is open
  useEffect(() => {
    document.body.style.overflow = searchOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [searchOpen]);

  const { data: collections = [] } = useQuery({
    queryKey: ['shopify-collections'],
    queryFn: () => fetchCollections(10),
  });

  const handleNav = (to: string) => {
    setSidebarOpen(false);
    navigate(to);
  };

  const openSearch = () => {
    setSearchOpen(true);
    // Use requestAnimationFrame to ensure the input is rendered before focusing
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  // ESC to close
  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchOpen]);

  return (
    <>
      <header ref={headerRef} className="sticky top-0 z-40 border-b border-white/10">
        <AnimatePresence mode="wait">
          {searchOpen ? (
            <motion.div
              key="search-bar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="glass-dark h-16 flex items-center relative z-50"
            >
              <div className="container flex items-center gap-3 h-full">
                <Search className="h-5 w-5 text-accent-foreground/70 shrink-0" />
                  <input
                   ref={searchInputRef}
                   type="text"
                   autoFocus
                   value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, collections..."
                  className="flex-1 bg-transparent text-accent-foreground text-sm outline-none placeholder:text-accent-foreground/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.length >= 1) {
                      closeSearch();
                      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
                    }
                  }}
                />
                <button onClick={closeSearch} className="p-2 text-accent-foreground/70 hover:text-accent-foreground transition-colors" aria-label="Close search">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="normal-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="glass-heavy h-16"
            >
              <div className="container relative flex h-16 items-center justify-between">
                {/* Left: Logo */}
                <div className="flex items-center">
                  <Link to="/">
                    <span className="text-accent text-xl tracking-wide" style={{ fontFamily: 'PorshaRichela' }}>ancientika</span>
                  </Link>
                </div>

                {/* Center: Desktop Shop nav with dropdown */}
                <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center">
                  <ShopDropdown collections={collections} navigate={navigate} />
                </nav>

                {/* Right: Search + Cart + Hamburger */}
                <div className="flex items-center gap-3">
                  <button onClick={openSearch} className="p-2 hover:text-accent transition-colors" aria-label="Search">
                    <Search className="h-5 w-5" />
                  </button>
                  
                  <button onClick={() => setIsOpen(true)} className="p-2 hover:text-accent transition-colors relative" aria-label="Cart">
                    <ShoppingBag className="h-5 w-5" />
                    {totalItems > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-medium">
                        {totalItems}
                      </span>
                    )}
                  </button>

                  <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                      <button className="p-2 hover:text-accent transition-colors" aria-label="Menu">
                        <Menu className="h-5 w-5" />
                      </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-56 glass-heavy bg-background/80">
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
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <PredictiveSearch open={searchOpen} query={searchQuery} onClose={closeSearch} onNavigate={(path) => { closeSearch(); navigate(path); }} headerRef={headerRef} />
      </header>

      {/* Dim overlay when search is open */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/50"
            onClick={closeSearch}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
}
