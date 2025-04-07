import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Dimensions, ActivityIndicator, View, StatusBar } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { ThemedView } from '@/components/ThemedView';
import { FilterBar } from '@/components/FilterBar';
import { ThemedText } from '@/components/ThemedText';
import { supabase } from '@/lib/supabase';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { ClothingCard } from '@/components/ClothingCard';

const { width } = Dimensions.get('window');

type Outfit = {
  outfit_id: string;
  image: string;
  name: string;
  price: number;
  gender: 'Men' | 'Women' | 'Unisex';
};

export default function HomeScreen() {
  const [visibleIndex, setVisibleIndex] = useState(0);
  const navigation = useNavigation<NavigationProp<ParamListBase & { params: { refresh?: number } }>>();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [filteredOutfits, setFilteredOutfits] = useState<Outfit[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const handleGenderFilter = (genders: string[]) => {
    setSelectedGenders(genders);
    if (genders.length === 0) {
      setFilteredOutfits(outfits);
    } else {
      const filtered = outfits.filter(outfit => genders.includes(outfit.gender));
      setFilteredOutfits(filtered);
    }
  };

  useEffect(() => {
    loadOutfits();
  }, []);

  const loadOutfits = async () => {
    try {
      console.log('Starting to fetch outfits...');
      let { data: outfits, error } = await supabase
        .from('outfits')
        .select('outfit_id, image, name, price, gender');

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
      setFilteredOutfits(outfits);
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
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <FilterBar onGenderFilter={handleGenderFilter} />
      </View>
      <View style={styles.swiperContainer}>
        <Swiper
          cards={filteredOutfits}
          renderCard={(outfit, cardIndex) => {
            if (!outfit) {
              return (
                <View style={styles.placeholderCard}>
                  <ActivityIndicator size="large" color="#000000" />
                </View>
              );
            }
            return (
              <ClothingCard
                key={outfit.outfit_id}
                outfit_id={outfit.outfit_id}
                image={outfit.image}
                name={outfit.name}
                price={outfit.price}
                onWishlistUpdate={() => navigation.setParams({ refresh: Date.now() })}
              />
            );
          }}
          onSwipedLeft={(cardIndex) => setVisibleIndex(cardIndex + 1)}
          onSwipedRight={(cardIndex) => setVisibleIndex(cardIndex + 1)}
          onSwipedAll={() => {
            setVisibleIndex(0);
            loadOutfits();
          }}
          cardIndex={0}
          backgroundColor="transparent"
          stackSize={2}
          containerStyle={styles.swiperContent}
          stackSeparation={15}
          animateCardOpacity
          verticalSwipe={false}
          cardVerticalMargin={80}
          cardHorizontalMargin={20}
          disableTopSwipe
          disableBottomSwipe
          outputRotationRange={["-8deg", "0deg", "8deg"]}
          useViewOverflow={false}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  swiperContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  swiperContent: {
    marginTop: -60,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  placeholderCard: {
    width: width * 0.9,
    height: width * 1.2,
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});