import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, View, Dimensions, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
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
  description?: string;
  onWishlistUpdate?: () => void;
};

export function ClothingCard({ outfit_id, image, name, price, description, onWishlistUpdate }: Outfit) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
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

  const handleCardPress = () => {
    setShowDescription(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <>
      <Pressable onPress={handleCardPress}>
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
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showDescription}
        onRequestClose={() => setShowDescription(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{name}</ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDescription(false)}
              >
                <IconSymbol name="xmark.circle.fill" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.modalScrollContent}
            >
              <Image source={{ uri: image }} style={styles.modalImage} />
              <View style={styles.modalDetails}>
                <ThemedText style={styles.modalPrice}>₹{price.toFixed(2)}</ThemedText>
                {description && (
                  <ThemedText style={styles.modalDescription}>{description}</ThemedText>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalScrollView: {
    maxHeight: '100%',
  },
  modalScrollContent: {
    padding: 20,
  },
  modalImage: {
    width: '100%',
    height: width * 0.8,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalDetails: {
    gap: 12,
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
});
