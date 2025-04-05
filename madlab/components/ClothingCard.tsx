import { StyleSheet, Image, View, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

type Outfit = {
  outfit_id: string;
  image: string;
};

export function ClothingCard({ outfit_id, image }: Outfit) {
  return (
    <View style={styles.card} key={outfit_id}>
      <Image source={{ uri: image }} style={styles.image} />
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
}); 