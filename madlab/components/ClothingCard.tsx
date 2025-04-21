import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, View, Dimensions, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import Animated, {
  useSharedValue,
  withSpring,
  withSequence,
  useAnimatedStyle,
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
  const [isProcessing, setIsProcessing] = useState(false);
  const scale = useSharedValue(1);
  const { session } = useAuth();

  useEffect(() => {
    checkIfLiked();
  }, [outfit_id]);

  const checkIfLiked = async () => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('outfit_id', outfit_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking wishlist:', error);
      return;
    }

    setIsLiked(!!data);
  };

  const animatePress = () => {
    scale.value = withSpring(0.95, { damping: 15, mass: 0.5 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, mass: 0.5 });
    }, 50);
  };

  const toggleLike = async () => {
    if (isProcessing || !session?.user) {
      Toast.show({
        type: 'error',
        text1: 'Please login to add to wishlist',
        position: 'bottom',
        bottomOffset: 80,
      });
      return;
    }

    setIsProcessing(true);

    setIsLiked(prev => !prev);
    scale.value = withSequence(withSpring(1.2), withSpring(1));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (!isLiked) {
        const { error } = await supabase.from('wishlist').insert([
          {
            user_id: session.user.id,
            outfit_id,
          },
        ]);
        if (error) throw error;

        Toast.show({
          type: 'success',
          text1: 'Added to wishlist',
          position: 'bottom',
          bottomOffset: 80,
        });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', session.user.id)
          .eq('outfit_id', outfit_id);

        if (error) throw error;

        Toast.show({
          type: 'success',
          text1: 'Removed from wishlist',
          position: 'bottom',
          bottomOffset: 80,
        });
      }

      onWishlistUpdate?.();
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      setIsLiked(prev => !prev); // Revert
      Toast.show({
        type: 'error',
        text1: 'Failed to update wishlist',
        position: 'bottom',
        bottomOffset: 80,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <ThemedText style={styles.productTitle} numberOfLines={1}>
          {name}
        </ThemedText>
        <ThemedText style={styles.productPrice}>₹{price.toFixed(2)}</ThemedText>
      </View>
      <Image source={{ uri: image }} style={styles.image} />
      <Animated.View style={[styles.buttonContainer, animatedStyle]}>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={toggleLike}
          disabled={isProcessing}
        >
          <IconSymbol
            name={isLiked ? 'heart.fill' : 'heart'}
            size={24}
            color={isLiked ? '#FF3B30' : '#000000'}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  card: {
    width: width * 0.9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: width,
    resizeMode: 'cover',
  },
  buttonContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
  },
  likeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
