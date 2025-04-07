import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

type FilterOption = {
  icon: string;
  label: string;
};

const filters: FilterOption[] = [
  { icon: 'person', label: 'Gender' },
  { icon: 'dollarsign', label: 'Price' },
  { icon: 'ruler', label: 'Size' },
  { icon: 'paintpalette', label: 'Color' },
];

export function FilterBar() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.filterButton}>
        <IconSymbol name="line.3.horizontal.decrease" size={18} color="#FFFFFF" />
      </TouchableOpacity>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter, index) => (
          <TouchableOpacity 
            key={filter.label} 
            style={styles.filterOption}
          >
            <ThemedText style={styles.filterText}>{filter.label}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: 'transparent',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    gap: 8,
    paddingRight: 16,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
