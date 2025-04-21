import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

type GenderFilter = 'Men' | 'Women' | 'Unisex';

type FilterOption = {
  icon: string;
  label: string;
  type: 'gender' | 'price' | 'size' | 'color';
};

const filters: FilterOption[] = [
  { icon: 'person', label: 'Gender', type: 'gender' },
  { icon: 'dollarsign', label: 'Price', type: 'price' },
  { icon: 'ruler', label: 'Size', type: 'size' },
  { icon: 'paintbrush', label: 'Color', type: 'color' },
];

type FilterBarProps = {
  onGenderFilter: (genders: GenderFilter[]) => void;
};

export function FilterBar({ onGenderFilter }: FilterBarProps) {
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [selectedGenders, setSelectedGenders] = useState<GenderFilter[]>([]);

  const handleGenderSelect = (gender: GenderFilter) => {
    const newSelection = selectedGenders.includes(gender)
      ? selectedGenders.filter((g: GenderFilter) => g !== gender)
      : [...selectedGenders, gender];
    
    setSelectedGenders(newSelection);
    onGenderFilter(newSelection);
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.filterButton}>
        <IconSymbol name="line.3.horizontal" size={20} color="#000000" />
      </TouchableOpacity>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity 
            key={filter.label} 
            style={[styles.filterOption, filter.type === 'gender' && selectedGenders.length > 0 && styles.activeFilter]}
            onPress={() => filter.type === 'gender' && setShowGenderModal(true)}
          >
            <IconSymbol name={filter.icon} size={16} color="#000000" style={styles.filterIcon} />
            <ThemedText style={styles.filterText}>{filter.label}</ThemedText>
            {filter.type === 'gender' && selectedGenders.length > 0 && (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>{selectedGenders.length}</ThemedText>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {showGenderModal && (
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGenderModal(false)}
        >
          <View style={styles.modal}>
            <View style={styles.modalHandle} />
            <ThemedText style={styles.modalTitle}>Filter by Gender</ThemedText>
            {['Men', 'Women', 'Unisex'].map((gender) => (
              <TouchableOpacity 
                key={gender} 
                style={styles.modalOption}
                onPress={() => handleGenderSelect(gender as GenderFilter)}
              >
                <View style={[styles.checkbox, selectedGenders.includes(gender as GenderFilter) && styles.checkboxSelected]}>
                  {selectedGenders.includes(gender as GenderFilter) && (
                    <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <ThemedText style={styles.modalOptionText}>{gender}</ThemedText>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowGenderModal(false)}
            >
              <ThemedText style={styles.modalCloseText}>Apply</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: 120, // Add padding from top to move modal down
    alignItems: 'center',
    zIndex: 1000,
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
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
});
