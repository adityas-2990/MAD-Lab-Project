import { StyleSheet, FlatList, View, Dimensions, Image, TouchableOpacity, Alert, Pressable } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect, useRoute, ParamListBase } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = CARD_WIDTH * 1.2;

type WishlistItem = {
  outfit_id: string;
  outfits: {
    image: string;
    outfit_id: string;
  } | null;
};

type WishlistResponse = {
  outfit_id: string;
  outfits: {
    image: string;
    outfit_id: string;
  } | null;
}[];

export default function WishlistScreen() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const route = useRoute<RouteProp<ParamListBase & { params: { refresh?: number } }>>();
  const params = route.params as { refresh?: number } | undefined;

  // Refresh wishlist when the screen comes into focus or when refresh param changes
  useFocusEffect(
    useCallback(() => {
      fetchWishlistItems();
    }, [params?.refresh])
  );

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const removeFromWishlist = async (outfitId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('outfit_id', outfitId);

      if (error) throw error;

      setWishlistItems(prev => prev.filter(item => item.outfit_id !== outfitId));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: 'success',
        text1: 'Removed from wishlist',
        position: 'bottom',
        bottomOffset: 80,
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      Toast.show({
        type: 'error',
        text1: 'Error removing from wishlist',
        position: 'bottom',
        bottomOffset: 80,
      });
    }
  };

  const handleRemove = (outfitId: string) => {
    Alert.alert(
      'Remove from Wishlist',
      'Are you sure you want to remove this item from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeFromWishlist(outfitId)
        },
      ]
    );
  };

  const fetchWishlistItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          outfit_id,
          outfits (
            image,
            outfit_id
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyState}>
          <IconSymbol name="heart.slash" size={60} color="#666666" />
          <ThemedText style={styles.emptyStateText}>Your wishlist is empty</ThemedText>
          <ThemedText style={styles.emptyStateSubtext}>Swipe right on outfits to add them here</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>My Wishlist</ThemedText>
        <ThemedText style={styles.subtitle}>{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved</ThemedText>
      </View>
      <FlatList
        data={wishlistItems}
        keyExtractor={(item) => item.outfit_id}
        renderItem={({ item }) => (
          <Animated.View 
            entering={FadeInRight.duration(300)} 
            exiting={FadeOutLeft.duration(200)}
            style={styles.cardContainer}
          >
            {item.outfits && (
              <Pressable 
                style={({ pressed }) => [{
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  width: '100%',
                }]}
              >
                <Image 
                  source={{ uri: item.outfits.image }} 
                  style={styles.cardImage} 
                />
                <View style={styles.cardOverlay}>
                  <TouchableOpacity 
                    style={styles.removeButton} 
                    onPress={() => handleRemove(item.outfit_id)}
                  >
                    <ThemedText style={styles.removeButtonText}>Remove</ThemedText>
                  </TouchableOpacity>
                </View>
              </Pressable>
            )}
          </Animated.View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    gap: 24,
  },
  cardContainer: {
    alignItems: 'center',
    width: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
  },
  removeButton: {
    backgroundColor: 'rgba(255, 55, 95, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 24,
    marginTop: 24,
    marginBottom: 12,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 