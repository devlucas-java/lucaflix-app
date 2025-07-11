import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type {
  AnimeSimpleDTO,
  MovieSimpleDTO,
  SerieSimpleDTO,
  MediaComplete,
} from '../types/mediaTypes';
import { isMovieSimple, isSerieSimple, isAnimeSimple } from '../types/mediaTypes';
import { movieService } from '../service/movieService';
import { serieService } from '../service/seriesService';
import { animeService } from '../service/animeService';

interface MovieCardProps {
  media: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO;
  isLarge?: boolean;
  isTop10?: boolean;
  top10Position?: number;
  size?: "P" | "M" | "G";
  loading?: boolean;
  onPress?: () => void; // Prop opcional para customizar o comportamento
}

export const MovieCard: React.FC<MovieCardProps> = ({
  media,
  isLarge = false,
  isTop10 = false,
  top10Position,
  size = "M",
  loading = false,
  onPress, // Se fornecido, usa esse callback em vez da lógica interna
}) => {
  const navigation = useNavigation();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getDimensions = () => {
    if (isLarge) return { width: 160, height: 240 };
    
    switch (size) {
      case "P": return { width: 100, height: 150 };
      case "G": return { width: 140, height: 210 };
      default: return { width: 120, height: 180 };
    }
  };

  const getImageUrls = () => {
    if (loading) return [];
    const urls: string[] = [];
    if (media.posterURL1) urls.push(media.posterURL1);
    if (media.posterURL2) urls.push(media.posterURL2);
    return urls.filter((url) => url && url.trim() !== "");
  };

  const handleImageError = () => {
    const imageUrls = getImageUrls();
    if (currentImageIndex < imageUrls.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setImageLoaded(false);
      setImageError(false);
    } else {
      setImageError(true);
      setImageLoaded(false);
    }
  };

  const fetchCompleteMedia = async (): Promise<MediaComplete> => {
    if (isMovieSimple(media)) {
      return await movieService.getMovieById(media.id);
    } else if (isSerieSimple(media)) {
      return await serieService.getSerieById(media.id);
    } else if (isAnimeSimple(media)) {
      return await animeService.getAnimeById(media.id);
    }
    throw new Error('Tipo de mídia não reconhecido');
  };

  const handleCardPress = async () => {
    if (actionLoading || loading) return;
    
    // Se há um callback customizado, usa ele
    if (onPress) {
      onPress();
      return;
    }
    
    // Caso contrário, usa a lógica original
    try {
      setActionLoading(true);
      const completeMedia = await fetchCompleteMedia();
      navigation.navigate('MediaScreen', { media: completeMedia });
    } catch (error) {
      console.error("Erro ao carregar detalhes da mídia:", error);
      navigation.navigate('MediaScreen', { media });
    } finally {
      setActionLoading(false);
    }
  };

  const getCurrentImageUrl = () => {
    const imageUrls = getImageUrls();
    return imageUrls[currentImageIndex] || null;
  };

  const currentImageUrl = getCurrentImageUrl();
  const dimensions = getDimensions();

  // Skeleton loading
  if (loading) {
    return (
      <View className="relative flex-shrink-0 mx-0">
        {isTop10 && top10Position && (
          <View 
            className="absolute z-0 flex items-center justify-center"
            style={{
              left: -(dimensions.width * 0.45),
              top: 0,
              width: dimensions.width * 0.7,
              height: dimensions.height,
            }}
          >
            <View 
              className="bg-gray-600 rounded"
              style={{
                width: dimensions.width * 0.6,
                height: dimensions.height * 0.75,
              }}
            />
          </View>
        )}

        <View 
          className="bg-gray-700 rounded-lg animate-pulse"
          style={dimensions}
        >
          <View className="w-full h-full bg-gray-600 rounded-lg" />
        </View>
      </View>
    );
  }

  return (
    <View className={`relative flex-shrink-0 ${isTop10 ? 'mx-4' : 'mx-0'}`}>
      {/* Número do Top 10 */}
      {isTop10 && top10Position && (
        <View 
          className="absolute z-0 flex items-center justify-center"
          style={{
            left: -(dimensions.width * 0.45),
            top: 0,
            width: dimensions.width * 0.7,
            height: dimensions.height,
          }}
        >
          <Text 
            className="font-black text-gray-300 opacity-80"
            style={{
              fontSize: dimensions.height * 0.75,
              lineHeight: dimensions.height * 0.85,
              textShadowColor: '#000',
              textShadowOffset: { width: 2, height: 2 },
              textShadowRadius: 4,
            }}
          >
            {top10Position}
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={handleCardPress}
        activeOpacity={0.8}
        className="relative z-10"
        style={dimensions}
        disabled={actionLoading}
      >
        {/* Loading da ação */}
        {actionLoading && (
          <View className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 rounded-lg">
            <ActivityIndicator size="large" color="#E50914" />
            <Text className="text-white text-xs mt-2">Carregando...</Text>
          </View>
        )}

        {/* Container da imagem */}
        <View 
          className="rounded-lg overflow-hidden bg-gray-900 shadow-2xl"
          style={dimensions}
        >
          {/* Imagem */}
          {currentImageUrl && !imageError ? (
            <Image
              source={{ uri: currentImageUrl }}
              className="rounded-lg"
              style={dimensions}
              onError={handleImageError}
              onLoad={() => setImageLoaded(true)}
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
              <Text className="text-gray-500 text-center px-2 text-sm" numberOfLines={3}>
                {media.title}
              </Text>
            </View>
          )}

          {/* Loading da imagem */}
          {currentImageUrl && !imageLoaded && !imageError && (
            <View className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
              <ActivityIndicator size="small" color="#E50914" />
              <Text className="text-gray-400 text-xs mt-2">Carregando...</Text>
            </View>
          )}

          {/* Avaliação fixa no canto superior esquerdo */}
          {media.avaliacao != null && (
            <View className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded-full flex-row items-center">
              <Icon name="star" size={10} color="#EAB308" />
              <Text className="text-yellow-500 text-xs ml-1 font-bold">
                {media.avaliacao.toFixed(1)}
              </Text>
            </View>
          )}

          {/* Likes fixo no canto inferior direito */}
          <View className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded-full flex-row items-center">
            <Ionicons name="thumbs-up" size={10} color="#10B981" />
            <Text className="text-emerald-500 text-xs ml-1 font-medium">
              {media.totalLikes}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};