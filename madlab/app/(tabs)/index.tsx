import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, Image, ActivityIndicator, View } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

type Outfit = {
  outfit_id: string;
  image: string;
};

export default function HomeScreen() {
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

      console.log('Supabase response:', { data: outfits, error }); // More detailed debug log

      if (error) {
        console.error('Supabase error:', error);
        return;
      }

      if (!outfits || outfits.length === 0) {
        console.log('No outfits found in database');
        setOutfits([]);
        return;
      }

      console.log('Setting outfits:', outfits); // Log the outfits being set
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
            <View style={styles.card}>
              <Image source={{ uri: outfit.image }} style={styles.image} />
            </View>
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
  text: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});