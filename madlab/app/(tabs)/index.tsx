import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Dimensions, ActivityIndicator, View, StatusBar, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { ThemedView } from '@/components/ThemedView';
import { FilterBar } from '@/components/FilterBar';
import { ThemedText } from '@/components/ThemedText';
import { supabase } from '@/lib/supabase';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { ClothingCard } from '@/components/ClothingCard';
import { IconSymbol } from '@/components/ui/IconSymbol';

const { width } = Dimensions.get('window');

type Outfit = {
  id: string;
  name: string;
  price: number;
  gender: 'Men' | 'Women' | 'Unisex';
  category: 'Shirt' | 'T-Shirt' | 'Pants' | 'Jeans' | 'Dress' | 'Jacket' | 'Sweater' | 'Skirt' | 'Shorts' | 'Hoodie';
  color: 'Black' | 'White' | 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Purple' | 'Pink';
  imageUrl: string;
  description?: string;
};

type PriceFilter = 'Under ₹1000' | '₹1000-₹2000' | '₹2000-₹4000' | '₹4000-₹6000' | '₹6000-₹8000' | 'Over ₹8000';
type CategoryFilter = 'Shirt' | 'T-Shirt' | 'Pants' | 'Jeans' | 'Dress' | 'Jacket' | 'Sweater' | 'Skirt' | 'Shorts' | 'Hoodie';
type ColorFilter = 'Black' | 'White' | 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Purple' | 'Pink';

export default function HomeScreen() {
  const [visibleIndex, setVisibleIndex] = useState(0);
  const navigation = useNavigation<NavigationProp<ParamListBase & { params: { refresh?: number } }>>();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [filteredOutfits, setFilteredOutfits] = useState<Outfit[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<('Men' | 'Women' | 'Unisex')[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<PriceFilter[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CategoryFilter[]>([]);
  const [selectedColors, setSelectedColors] = useState<ColorFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [allOutfitsSwiped, setAllOutfitsSwiped] = useState(false);

  const resetAndReload = () => {
    console.log('Resetting all filters and reloading outfits');
    // Clear all filter states
    setSelectedGenders([]);
    setSelectedPrices([]);
    setSelectedCategories([]);
    setSelectedColors([]);
    
    // Set loading state to true to show loading indicator
    setLoading(true);
    
    // Reset the visible index to 0 to start from the first card
    setVisibleIndex(0);
    
    // Reload outfits from the database
    loadOutfits();
  };

  const handleGenderFilter = (genders: ('Men' | 'Women' | 'Unisex')[]) => {
    console.log('Gender filter changed:', genders);
    setSelectedGenders(genders);
  };

  const handlePriceFilter = (prices: PriceFilter[]) => {
    console.log('Price filter changed:', prices);
    setSelectedPrices(prices);
  };

  const handleCategoryFilter = (categories: CategoryFilter[]) => {
    console.log('Category filter changed:', categories);
    setSelectedCategories(categories);
  };

  const handleColorFilter = (colors: ColorFilter[]) => {
    console.log('Color filter changed:', colors);
    setSelectedColors(colors);
  };

  const applyFilters = (
    genders: ('Men' | 'Women' | 'Unisex')[],
    prices: PriceFilter[],
    categories: CategoryFilter[],
    colors: ColorFilter[]
  ) => {
    console.log('Applying filters:', { genders, prices, categories, colors });
    
    // If all filters are empty, show all outfits
    if (genders.length === 0 && prices.length === 0 && categories.length === 0 && colors.length === 0) {
      console.log('All filters cleared, showing all outfits');
      setFilteredOutfits([...outfits]);
      return;
    }

    let filtered = [...outfits];

    // Apply gender filter
    if (genders.length > 0) {
      filtered = filtered.filter((outfit) => genders.includes(outfit.gender));
    }

    // Apply price filter
    if (prices.length > 0) {
      filtered = filtered.filter((outfit) => {
        return prices.some((price) => {
          switch (price) {
            case 'Under ₹1000':
              return outfit.price < 1000;
            case '₹1000-₹2000':
              return outfit.price >= 1000 && outfit.price <= 2000;
            case '₹2000-₹4000':
              return outfit.price > 2000 && outfit.price <= 4000;
            case '₹4000-₹6000':
              return outfit.price > 4000 && outfit.price <= 6000;
            case '₹6000-₹8000':
              return outfit.price > 6000 && outfit.price <= 8000;
            case 'Over ₹8000':
              return outfit.price > 8000;
            default:
              return false;
          }
        });
      });
    }

    // Apply category filter
    if (categories.length > 0) {
      filtered = filtered.filter((outfit) => categories.includes(outfit.category));
    }

    // Apply color filter
    if (colors.length > 0) {
      filtered = filtered.filter((outfit) => colors.includes(outfit.color));
    }

    console.log('Filtered outfits:', filtered.length);
    setFilteredOutfits(filtered);
  };

  // Add a useEffect to handle filter changes
  useEffect(() => {
    if (outfits.length > 0) {
      applyFilters(selectedGenders, selectedPrices, selectedCategories, selectedColors);
    }
  }, [selectedGenders, selectedPrices, selectedCategories, selectedColors, outfits]);

  useEffect(() => {
    loadOutfits();
  }, []);

  const loadOutfits = async () => {
    try {
      console.log('Starting to fetch outfits...');
      let { data: outfits, error } = await supabase
        .from('outfits')
        .select('outfit_id, image, name, price, gender, category, color, description');

      console.log('Supabase response:', { data: outfits, error });

      if (error) {
        console.error('Supabase error:', error);
        return;
      }

      if (!outfits || outfits.length === 0) {
        console.log('No outfits found in database');
        setOutfits([]);
        setFilteredOutfits([]);
        return;
      }

      // Transform the data to match our Outfit type
      const transformedOutfits: Outfit[] = outfits.map(outfit => ({
        id: outfit.outfit_id,
        imageUrl: outfit.image,
        name: outfit.name,
        price: outfit.price,
        gender: outfit.gender,
        category: outfit.category,
        color: outfit.color,
        description: outfit.description
      }));

      console.log('Setting outfits:', transformedOutfits);
      setOutfits(transformedOutfits);
      setFilteredOutfits(transformedOutfits);
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
        <FilterBar 
          onGenderFilter={handleGenderFilter}
          onPriceFilter={handlePriceFilter}
          onCategoryFilter={handleCategoryFilter}
          onColorFilter={handleColorFilter}
          resetAndReload={resetAndReload}
        />
      </View>
      <View style={styles.swiperContainer}>
        {filteredOutfits.length === 0 ? (
          <View style={styles.noOutfitsContainer}>
            <IconSymbol 
              name="magnifyingglass" 
              size={60} 
              color="#000000" 
              style={styles.noOutfitsIcon}
            />
            <ThemedText style={styles.noOutfitsText}>No outfits found matching your filters</ThemedText>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetAndReload}
            >
              <ThemedText style={styles.resetButtonText}>Reset Filters</ThemedText>
            </TouchableOpacity>
          </View>
        ) : allOutfitsSwiped ? (
          <View style={styles.noOutfitsContainer}>
            <IconSymbol 
              name="tshirt.fill" 
              size={60} 
              color="#000000" 
              style={styles.noOutfitsIcon}
            />
            <ThemedText style={styles.noOutfitsText}>No more outfits left</ThemedText>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                setAllOutfitsSwiped(false);
                setVisibleIndex(0);
              }}
            >
              <ThemedText style={styles.resetButtonText}>Start Over</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
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
                  key={outfit.id}
                  outfit_id={outfit.id}
                  image={outfit.imageUrl}
                  name={outfit.name}
                  price={outfit.price}
                  description={outfit.description}
                  onWishlistUpdate={() => navigation.setParams({ refresh: Date.now() })}
                />
              );
            }}
            onSwipedLeft={(cardIndex) => setVisibleIndex(cardIndex + 1)}
            onSwipedRight={(cardIndex) => setVisibleIndex(cardIndex + 1)}
            onSwipedAll={() => {
              setAllOutfitsSwiped(true);
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
        )}
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
  noOutfitsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noOutfitsIcon: {
    marginBottom: 20,
  },
  noOutfitsText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#000000',
  },
  resetButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
});