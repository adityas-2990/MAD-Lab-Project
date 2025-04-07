import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Dimensions, ActivityIndicator, View } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { supabase } from '@/lib/supabase';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { ClothingCard } from '@/components/ClothingCard';

const { width } = Dimensions.get('window');

type Outfit = {
  outfit_id: string;
  image: string;
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase & { params: { refresh?: number } }>>();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOutfits();
  }, []);

  const loadOutfits = async () => {
    try {
      console.log('Starting to fetch outfits...');
      let { data: outfits, error } = await supabase
        .from('outfits')
        .select('outfit_id, image');

      console.log('Supabase response:', { data: outfits, error });

      if (error) {
        console.error('Supabase error:', error);
        return;
      }

      if (!outfits || outfits.length === 0) {
        console.log('No outfits found in database');
        setOutfits([]);
        return;
      }

      console.log('Setting outfits:', outfits);
      setOutfits(outfits);
    } catch (error) {
      console.error('Error loading outfits:', error);
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

  if (!outfits || outfits.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.text}>No outfits found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Swiper
        cards={outfits}
        renderCard={(outfit) => {
          if (!outfit) return null;
          return (
            <ClothingCard
              outfit_id={outfit.outfit_id}
              image={outfit.image}
              onWishlistUpdate={() => {
                // Force a refresh of the wishlist screen when it becomes focused next time
                navigation.setParams({ refresh: Date.now() });
              }}
            />
          );
        }}
        onSwipedLeft={(cardIndex) => {
          console.log('Swiped left:', cardIndex);
        }}
        onSwipedRight={(cardIndex) => {
          console.log('Swiped right:', cardIndex);
        }}
        onSwipedAll={() => {
          console.log('All outfits swiped');
          loadOutfits();
        }}
        cardIndex={0}
        backgroundColor="#000000"
        stackSize={3}
        stackSeparation={15}
        animateCardOpacity
        verticalSwipe={false}
        cardVerticalMargin={80}
        cardHorizontalMargin={20}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});