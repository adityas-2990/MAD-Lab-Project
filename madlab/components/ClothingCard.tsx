import { StyleSheet, Image, View, Dimensions, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withTiming,
  useSharedValue,
  withDelay,
  runOnJS
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type Outfit = {
  outfit_id: string;
  image: string;
  onWishlistUpdate?: () => void;
};

export function ClothingCard({ outfit_id, image, onWishlistUpdate }: Outfit) {
  const [isLiked, setIsLiked] = useState(false);
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

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

  const toggleLike = async () => {
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

      if (isLiked) {
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

      setIsLiked(!isLiked);
      if (onWishlistUpdate) {
        onWishlistUpdate();
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      Toast.show({
        type: 'error',
        text1: 'Error updating wishlist',
        position: 'bottom',
        bottomOffset: 80,
      });
    }
  };

  const heartAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: heartScale.value }],
      opacity: heartOpacity.value,
    };
  });

  return (
    <View style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <Animated.View style={[styles.heartAnimation, heartAnimatedStyle]}>
        <IconSymbol 
          size={100} 
          name="heart.fill" 
          color="#FFFFFF" 
        />
      </Animated.View>
      <TouchableOpacity 
        style={styles.likeButton}
        onPress={toggleLike}
      >
        <IconSymbol 
          size={24} 
          name={isLiked ? "heart.fill" : "heart"} 
          color={isLiked ? "#FF375F" : "#FFFFFF"} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.9,
    height: width * 1.2,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 