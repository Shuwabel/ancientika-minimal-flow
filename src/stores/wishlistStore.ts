import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WishlistStore {
  items: string[];
  toggleItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (productId) => {
        const { items } = get();
        if (items.includes(productId)) {
          set({ items: items.filter(id => id !== productId) });
        } else {
          set({ items: [...items, productId] });
        }
      },
      isInWishlist: (productId) => get().items.includes(productId),
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
