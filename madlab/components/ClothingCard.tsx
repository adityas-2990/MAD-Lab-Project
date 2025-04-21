import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, View, Dimensions, TouchableOpacity } from 'react-native';
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
import { useWishlist } from '@/contexts/WishlistContext';

const { width } = Dimensions.get('window');

type Outfit = {
  outfit_id: string;
  image: string;
  name: string;
  price: number;
  onWishlistUpdate?: () => void;
};

export function ClothingCard({ outfit_id, image, name, price, onWishlistUpdate }: Outfit) {
  const [isProcessing, setIsProcessing] = useState(false);
  const scale = useSharedValue(1);
  const { session } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  // Use the isInWishlist function from the context to determine if the item is liked
  const isLiked = isInWishlist(outfit_id);

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
    scale.value = withSequence(withSpring(1.2), withSpring(1));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (!isLiked) {
        await addToWishlist(outfit_id);
        Toast.show({
          type: 'success',
          text1: 'Added to wishlist',
          position: 'bottom',
          bottomOffset: 80,
        });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await removeFromWishlist(outfit_id);
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
            name={isLiked ? 'heart.fill' : 'heart.circle'}
            size={32}
            color={isLiked ? '#FF3B30' : '#999999'}
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});
