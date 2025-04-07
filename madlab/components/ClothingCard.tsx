import { StyleSheet, Image, View, Dimensions, Pressable, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import Animated, { 
  withSpring,
  useAnimatedStyle,
  withTiming,
  useSharedValue
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type Outfit = {
  outfit_id: string;
  image: string;
  name: string;
  price: number;
  onWishlistUpdate?: () => void;
};

export function ClothingCard({ outfit_id, image, name, price, onWishlistUpdate }: Outfit) {
  const [isLiked, setIsLiked] = useState(false);
  const scale = useSharedValue(1);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    checkIfLiked();
  }, [outfit_id]);

  const checkIfLiked = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id)
        .eq('outfit_id', outfit_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking wishlist:', error);
        return;
      }

      setIsLiked(!!data);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const animatePress = () => {
    scale.value = withSpring(0.95, { damping: 15, mass: 0.5 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, mass: 0.5 });
    }, 50);
  };

  const toggleLike = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    // Optimistically update UI
    setIsLiked(prev => !prev);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Toast.show({
          type: 'error',
          text1: 'Please login to add to wishlist',
          position: 'bottom',
          bottomOffset: 80,
        });
        return;
      }

      const wasLiked = isLiked;
      if (wasLiked) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('outfit_id', outfit_id);

        if (error) throw error;

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({
          type: 'success',
          text1: 'Removed from wishlist',
          position: 'bottom',
          bottomOffset: 80,
        });
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert([
            {
              user_id: user.id,
              outfit_id: outfit_id,
            },
          ]);

        if (error) throw error;

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({
          type: 'success',
          text1: 'Added to wishlist',
          position: 'bottom',
          bottomOffset: 80,
        });
      }

      // UI is already updated
      setIsProcessing(false);
      if (onWishlistUpdate) {
        onWishlistUpdate();
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(prev => !prev);
      setIsProcessing(false);
      console.error('Error updating wishlist:', error);
      Toast.show({
        type: 'error',
        text1: 'Error updating wishlist',
        position: 'bottom',
        bottomOffset: 80,
      });
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  return (
    <View style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.overlay}>
        <View style={styles.productInfo}>
          <ThemedText style={styles.productTitle} numberOfLines={1}>{name}</ThemedText>
          <ThemedText style={styles.productPrice}>${price.toFixed(2)}</ThemedText>
        </View>
        <Animated.View style={[styles.buttonContainer, animatedStyle]}>
        <TouchableOpacity 
          style={styles.likeButton}
          onPress={toggleLike}
          disabled={isProcessing}
        >
          <ThemedText style={styles.buttonText}>Wishlist</ThemedText>
        </TouchableOpacity>
      </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  productInfo: {
    marginBottom: 16,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    color: '#FFFFFF',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  card: {
    width: width * 0.9,
    height: width * 1.2,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  buttonContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  likeButton: {
    backgroundColor: 'rgba(255, 55, 95, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
}); 