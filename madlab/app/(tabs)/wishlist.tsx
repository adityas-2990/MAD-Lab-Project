import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ClothingCard } from '@/components/ClothingCard';

const { width } = Dimensions.get('window');

type WishlistOutfit = {
  outfits: {
    outfit_id: string;
    image: string;
  };
};

export default function WishlistScreen() {
  const [wishlistItems, setWishlistItems] = useState<WishlistOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          outfits (
            outfit_id,
            image
          )
        `)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error fetching wishlist:', error);
        return;
      }

      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </ThemedView>
    );
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.text}>No saved outfits</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={wishlistItems}
        keyExtractor={(item) => item.outfits.outfit_id}
        renderItem={({ item }) => (
          <ClothingCard
            outfit_id={item.outfits.outfit_id}
            image={item.outfits.image}
            onWishlistUpdate={loadWishlist}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  text: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
}); 