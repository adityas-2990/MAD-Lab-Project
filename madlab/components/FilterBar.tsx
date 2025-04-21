import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

type GenderFilter = 'Men' | 'Women' | 'Unisex';
type PriceFilter = 'Under ₹1000' | '₹1000-₹2000' | '₹2000-₹4000' | '₹4000-₹6000' | '₹6000-₹8000' | 'Over ₹8000';
type CategoryFilter = 'Shirt' | 'T-Shirt' | 'Pants' | 'Jeans' | 'Dress' | 'Jacket' | 'Sweater' | 'Skirt' | 'Shorts' | 'Hoodie';
type ColorFilter = 'Black' | 'White' | 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Purple' | 'Pink';

type FilterOption = {
  icon: string;
  label: string;
  type: 'gender' | 'price' | 'category' | 'color';
};

const filters: FilterOption[] = [
  { icon: 'person.2.fill', label: 'Gender', type: 'gender' },
  { icon: 'indianrupeesign.circle.fill', label: 'Price', type: 'price' },
  { icon: 'tshirt.fill', label: 'Category', type: 'category' },
  { icon: 'paintpalette.fill', label: 'Color', type: 'color' },
];

type FilterBarProps = {
  onGenderFilter: (genders: GenderFilter[]) => void;
  onPriceFilter?: (prices: PriceFilter[]) => void;
  onCategoryFilter?: (categories: CategoryFilter[]) => void;
  onColorFilter?: (colors: ColorFilter[]) => void;
  resetAndReload?: () => void;
};

export function FilterBar({ 
  onGenderFilter,
  onPriceFilter = () => {},
  onCategoryFilter = () => {},
  onColorFilter = () => {},
  resetAndReload = () => {},
}: FilterBarProps) {
  const [activeModal, setActiveModal] = useState<'gender' | 'price' | 'category' | 'color' | null>(null);
  const [selectedGenders, setSelectedGenders] = useState<GenderFilter[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<PriceFilter[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CategoryFilter[]>([]);
  const [selectedColors, setSelectedColors] = useState<ColorFilter[]>([]);

  const handleGenderSelect = (gender: GenderFilter) => {
    const newSelection = selectedGenders.includes(gender)
      ? selectedGenders.filter((g) => g !== gender)
      : [...selectedGenders, gender];
    setSelectedGenders(newSelection);
    onGenderFilter(newSelection);
  };

  const handlePriceSelect = (price: PriceFilter) => {
    const newSelection = selectedPrices.includes(price)
      ? selectedPrices.filter((p) => p !== price)
      : [...selectedPrices, price];
    setSelectedPrices(newSelection);
    onPriceFilter(newSelection);
  };

  const handleCategorySelect = (category: CategoryFilter) => {
    const newSelectedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newSelectedCategories);
    onCategoryFilter(newSelectedCategories);
  };

  const handleColorSelect = (color: ColorFilter) => {
    const newSelection = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    setSelectedColors(newSelection);
    onColorFilter(newSelection);
  };

  const clearAllFilters = () => {
    console.log('Clearing all filters and reloading data');
    
    // Clear all local filter states
    setSelectedGenders([]);
    setSelectedPrices([]);
    setSelectedCategories([]);
    setSelectedColors([]);
    
    // Close any open modal
    setActiveModal(null);
    
    // Call the filter handlers with empty arrays to clear filters in parent component
    onGenderFilter([]);
    onPriceFilter([]);
    onCategoryFilter([]);
    onColorFilter([]);
    
    // Call the resetAndReload function to reset everything and fetch fresh data
    resetAndReload();
  };

  const openModal = (type: 'gender' | 'price' | 'category' | 'color') => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const getSelectedCount = (type: 'gender' | 'price' | 'category' | 'color') => {
    switch (type) {
      case 'gender':
        return selectedGenders.length;
      case 'price':
        return selectedPrices.length;
      case 'category':
        return selectedCategories.length;
      case 'color':
        return selectedColors.length;
      default:
        return 0;
    }
  };

  const hasActiveFilters = () => {
    return (
      selectedGenders.length > 0 ||
      selectedPrices.length > 0 ||
      selectedCategories.length > 0 ||
      selectedColors.length > 0
    );
  };

  const getActiveFilterCount = () => {
    return (
      selectedGenders.length +
      selectedPrices.length +
      selectedCategories.length +
      selectedColors.length
    );
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'gender':
        return (
          <>
            {(['Men', 'Women', 'Unisex'] as GenderFilter[]).map((gender) => (
              <TouchableOpacity
                key={gender}
                style={styles.modalOption}
                onPress={() => handleGenderSelect(gender)}>
                <View
                  style={[
                    styles.checkbox,
                    selectedGenders.includes(gender) && styles.checkboxSelected,
                  ]}>
                  {selectedGenders.includes(gender) && (
                    <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <ThemedText style={styles.modalOptionText}>{gender}</ThemedText>
              </TouchableOpacity>
            ))}
          </>
        );
      case 'price':
        return (
          <>
            {([
              'Under ₹1000',
              '₹1000-₹2000',
              '₹2000-₹4000',
              '₹4000-₹6000',
              '₹6000-₹8000',
              'Over ₹8000',
            ] as PriceFilter[]).map((price) => (
              <TouchableOpacity
                key={price}
                style={styles.modalOption}
                onPress={() => handlePriceSelect(price)}>
                <View
                  style={[
                    styles.checkbox,
                    selectedPrices.includes(price) && styles.checkboxSelected,
                  ]}>
                  {selectedPrices.includes(price) && (
                    <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <ThemedText style={styles.modalOptionText}>{price}</ThemedText>
              </TouchableOpacity>
            ))}
          </>
        );
      case 'category':
        return (
          <>
            {([
              'Shirt',
              'T-Shirt',
              'Pants',
              'Jeans',
              'Dress',
              'Jacket',
              'Sweater',
              'Skirt',
              'Shorts',
              'Hoodie',
            ] as CategoryFilter[]).map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.modalOption}
                onPress={() => handleCategorySelect(category)}>
                <View
                  style={[
                    styles.checkbox,
                    selectedCategories.includes(category) && styles.checkboxSelected,
                  ]}>
                  {selectedCategories.includes(category) && (
                    <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <ThemedText style={styles.modalOptionText}>{category}</ThemedText>
              </TouchableOpacity>
            ))}
          </>
        );
      case 'color':
        return (
          <>
            {([
              'Black',
              'White',
              'Red',
              'Blue',
              'Green',
              'Yellow',
              'Purple',
              'Pink',
            ] as ColorFilter[]).map((color) => (
              <TouchableOpacity
                key={color}
                style={styles.modalOption}
                onPress={() => handleColorSelect(color)}>
                <View
                  style={[
                    styles.checkbox,
                    selectedColors.includes(color) && styles.checkboxSelected,
                  ]}>
                  {selectedColors.includes(color) && (
                    <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <ThemedText style={styles.modalOptionText}>{color}</ThemedText>
              </TouchableOpacity>
            ))}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.label}
            style={[
              styles.filterOption,
              getSelectedCount(filter.type) > 0 && styles.activeFilter,
            ]}
            onPress={() => openModal(filter.type)}>
            <IconSymbol
              name={filter.icon as any}
              size={16}
              color="#000000"
              style={styles.filterIcon}
            />
            <ThemedText style={styles.filterText}>{filter.label}</ThemedText>
            {getSelectedCount(filter.type) > 0 && (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>
                  {getSelectedCount(filter.type)}
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>
        ))}
        {hasActiveFilters() && (
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={clearAllFilters}>
            <ThemedText style={styles.clearFilterText}>Clear All</ThemedText>
            {getActiveFilterCount() > 0 && (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>
                  {getActiveFilterCount()}
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        visible={activeModal !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHandle} />
            <ThemedText style={styles.modalTitle}>
              Filter by {filters.find(f => f.type === activeModal)?.label}
            </ThemedText>
            <ScrollView style={styles.modalScrollView}>
              {renderModalContent()}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeModal}>
              <ThemedText style={styles.modalCloseText}>Apply</ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    maxHeight: '80%',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    color: '#000000',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  modalCloseButton: {
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: '#000000',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activeFilter: {
    backgroundColor: '#E8E8E8',
  },
  badge: {
    backgroundColor: '#000000',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  filterIcon: {
    marginRight: 6,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    gap: 8,
    paddingRight: 16,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  clearFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF3B30',
  },
});
