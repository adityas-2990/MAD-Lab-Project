import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

type WishlistContextType = {
  wishlistItems: string[];
  addToWishlist: (outfitId: string) => Promise<void>;
  removeFromWishlist: (outfitId: string) => Promise<void>;
  isInWishlist: (outfitId: string) => boolean;
  refreshWishlist: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const { session } = useAuth();

  // Load wishlist items when the user logs in
  useEffect(() => {
    if (session?.user) {
      refreshWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [session]);

  const refreshWishlist = async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('outfit_id')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error fetching wishlist:', error);
        return;
      }

      setWishlistItems(data.map(item => item.outfit_id));
    } catch (error) {
      console.error('Error refreshing wishlist:', error);
    }
  };

  const addToWishlist = async (outfitId: string) => {
    if (!session?.user) return;

    try {
      const { error } = await supabase.from('wishlist').insert([
        {
          user_id: session.user.id,
          outfit_id: outfitId,
        },
      ]);

      if (error) throw error;

      setWishlistItems(prev => [...prev, outfitId]);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (outfitId: string) => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', session.user.id)
        .eq('outfit_id', outfitId);

      if (error) throw error;

      setWishlistItems(prev => prev.filter(id => id !== outfitId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };

  const isInWishlist = (outfitId: string) => {
    return wishlistItems.includes(outfitId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
} 