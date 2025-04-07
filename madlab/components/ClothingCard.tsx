import { StyleSheet, Image, View, Dimensions, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

type Outfit = {
  outfit_id: string;
  image: string;
  onWishlistUpdate?: () => void;
};

export function ClothingCard({ outfit_id, image, onWishlistUpdate }: Outfit) {
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    checkIfLiked();
  }, [outfit_id]);

  const checkIfLiked = async () => {
    if (!session?.user) return;
    
    const { data } = await supabase
      .from('wishlist')
      .select('*')
      .eq('outfit_id', outfit_id)
      .eq('user_id', session.user.id)
      .single();
    
    setIsLiked(!!data);
  };

  const toggleLike = async () => {
    if (!session?.user || loading) return;
    
    setLoading(true);
    try {
      if (isLiked) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('outfit_id', outfit_id)
          .eq('user_id', session.user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert([
            { 
              outfit_id: outfit_id,
              user_id: session.user.id,
            }
          ]);

        if (error) throw error;
      }
      setIsLiked(!isLiked);
      onWishlistUpdate?.();
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card} key={outfit_id}>
      <Image source={{ uri: image }} style={styles.image} />
      <TouchableOpacity 
        style={styles.likeButton}
        onPress={toggleLike}
        disabled={loading}
      >
        <MaterialIcons
          name={isLiked ? "favorite" : "favorite-border"}
          size={28}
          color={isLiked ? "#FF4B4B" : "#FFFFFF"}
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
  likeButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    padding: 8,
  },
}); 