import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
} from 'react-native';
import { getSimilar } from '../../utils/mediaService';
import { MovieCard } from '../../components/MovieCard';

interface SimilarProps {
  media: any;
  selectedTab: string;
  onMediaPress: (media: any) => void;
}

export const Similar: React.FC<SimilarProps> = ({
  media,
  selectedTab,
  onMediaPress,
}) => {
  const [similarMedia, setSimilarMedia] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    if (media && selectedTab === 'similares') {
      loadSimilarMedia();
    }
  }, [media, selectedTab]);

  const loadSimilarMedia = async () => {
    if (!media) return;
    setLoadingSimilar(true);
    try {
      const response = await getSimilar(media, 0, 20);
      setSimilarMedia(response.content);
    } catch (error) {
      console.error('Erro ao carregar similares:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  if (selectedTab !== 'similares') {
    return null;
  }

  if (loadingSimilar) {
    return (
      <View className="items-center justify-center py-8">
        <Text className="text-gray-400">Carregando similares...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={similarMedia}
      numColumns={3}
      renderItem={({ item }) => (
        <View className="mx-1 mb-4 flex-1">
          <MovieCard
            media={item}
            size="P"
            onPress={() => onMediaPress(item)}
          />
        </View>
      )}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ paddingHorizontal: 4 }}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
};