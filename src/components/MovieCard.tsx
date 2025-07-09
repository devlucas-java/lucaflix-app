import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Play, Info, Star, Calendar, Clock, Tv } from 'react-native-svg';
import type {
  AnimeSimpleDTO,
  MovieSimpleDTO,
  SerieSimpleDTO,
} from '../types/mediaTypes';
import { Type } from '../types/mediaTypes';
import { CATEGORIA_LABELS } from '../types/mediaTypes';

interface MovieCardProps {
  media: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO;
  onInfo: (media: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO) => void;
  isLarge?: boolean;
  isTop10?: boolean;
  top10Position?: number;
  size?: "P" | "M" | "G";
  loading?: boolean; // Controla se o card está em estado de loading
}

export const MovieCard: React.FC<MovieCardProps> = ({
  media,
  onInfo,
  isLarge = false,
  isTop10 = false,
  top10Position,
  size = "M",
  loading = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Dimensões baseadas no tamanho para React Native
  const getDimensions = () => {
    if (isLarge) {
      return { width: 200, height: 300 };
    }

    switch (size) {
      case "P":
        return { width: 120, height: 180 };
      case "G":
        return { width: 180, height: 270 };
      default:
        return { width: 140, height: 210 };
    }
  };

  // Lista de URLs de imagem disponíveis
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

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleCardPress = async () => {
    if (actionLoading || loading) return;
    try {
      setActionLoading(true);
      onInfo(media);
    } catch (error) {
      console.error("Erro ao abrir detalhes:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const getCurrentImageUrl = () => {
    const imageUrls = getImageUrls();
    return imageUrls[currentImageIndex] || null;
  };

  const getMediaInfo = () => {
    if (loading) {
      return {
        duration: "",
        type: "",
        extra: "",
        icon: Clock,
      };
    }

    switch (media.type) {
      case Type.MOVIE:
        return {
          duration: `${(media as MovieSimpleDTO).duracaoMinutos}min`,
          type: "Filme",
          extra: (media as MovieSimpleDTO).paisOrigen,
          icon: Clock,
        };
      case Type.SERIE:
        const serie = media as SerieSimpleDTO;
        return {
          duration: `${serie.totalTemporadas} temporada${serie.totalTemporadas > 1 ? "s" : ""}`,
          type: "Série",
          extra: `${serie.totalEpisodios} episódios`,
          icon: Tv,
        };
      case Type.ANIME:
        const anime = media as AnimeSimpleDTO;
        return {
          duration: `${anime.totalTemporadas} temporada${anime.totalTemporadas > 1 ? "s" : ""}`,
          type: "Anime",
          extra: `${anime.totalEpisodios} episódios`,
          icon: Tv,
        };
      default:
        return {
          duration: "N/A",
          type: "Desconhecido",
          extra: "",
          icon: Clock,
        };
    }
  };

  const currentImageUrl = getCurrentImageUrl();
  const mediaInfo = getMediaInfo();
  const MediaIcon = mediaInfo.icon;
  const dimensions = getDimensions();

  // Render do skeleton quando em loading
  if (loading) {
    return (
      <View className="relative flex-shrink-0 mx-1" style={{ marginLeft: isTop10 ? 60 : 4 }}>
        {/* Número do Top 10 (skeleton) */}
        {isTop10 && top10Position && (
          <View 
            className="absolute z-10 items-center justify-center"
            style={{
              left: -120,
              top: 0,
              width: dimensions.width,
              height: dimensions.height,
            }}
          >
            <View 
              className="bg-gray-700 rounded animate-pulse"
              style={{
                width: dimensions.width * 0.6,
                height: dimensions.height * 0.8,
              }}
            />
          </View>
        )}

        <View
          className="bg-gray-800 rounded-lg animate-pulse"
          style={dimensions}
        >
          {/* Skeleton da imagem */}
          <View className="w-full h-full bg-gray-700 rounded-lg" />
          
          {/* Skeleton do overlay */}
          <View className="absolute inset-0 p-2">
            <View className="flex-row justify-between items-start mb-2">
              <View className="w-12 h-6 bg-gray-600 rounded" />
              <View className="w-8 h-8 bg-gray-600 rounded-full" />
            </View>
            
            <View className="flex-1 justify-end">
              <View className="h-4 bg-gray-600 rounded mb-2" />
              <View className="h-3 bg-gray-600 rounded w-3/4" />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="relative flex-shrink-0 mx-1" style={{ marginLeft: isTop10 ? 60 : 4 }}>
      {/* Número do Top 10 */}
      {isTop10 && top10Position && (
        <View 
          className="absolute z-10 items-center justify-center"
          style={{
            left: -120,
            top: 0,
            width: dimensions.width,
            height: dimensions.height,
          }}
        >
          <Text 
            className="font-black text-gray-300/80 text-stroke"
            style={{
              fontSize: dimensions.height * 0.8,
              lineHeight: dimensions.height,
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
        className="relative"
        style={dimensions}
        disabled={actionLoading}
      >
        {/* Loading da ação no card */}
        {actionLoading && (
          <View className="absolute inset-0 z-20 items-center justify-center bg-black/50 rounded-lg">
            <ActivityIndicator size="large" color="#E50914" />
            <Text className="text-white text-xs mt-2">Carregando...</Text>
          </View>
        )}

        {/* Container da imagem */}
        <View 
          className="w-full h-full rounded-lg overflow-hidden bg-gray-900"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {/* Imagem */}
          {currentImageUrl && !imageError ? (
            <Image
              source={{ uri: currentImageUrl }}
              style={dimensions}
              className="rounded-lg"
              onError={handleImageError}
              onLoad={handleImageLoad}
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-gray-800 items-center justify-center rounded-lg">
              <Text className="text-gray-500 text-center px-2 text-sm" numberOfLines={3}>
                {media.title}
              </Text>
            </View>
          )}

          {/* Loading da imagem */}
          {currentImageUrl && !imageLoaded && !imageError && (
            <View className="absolute inset-0 items-center justify-center bg-gray-900 rounded-lg">
              <ActivityIndicator size="small" color="#E50914" />
              <Text className="text-gray-400 text-xs mt-2">Carregando imagem...</Text>
            </View>
          )}

          {/* Overlay de hover/press - sempre visível no mobile */}
          <View className="absolute inset-0 bg-black/60 rounded-lg opacity-0 active:opacity-100 transition-opacity duration-300">
            {/* Header com rating */}
            <View className="flex-row justify-between items-start p-2">
              {media.avaliacao != null && (
                <View className="bg-yellow-500 px-2 py-1 rounded-full flex-row items-center">
                  <Star width={10} height={10} fill="#000" />
                  <Text className="text-black text-xs font-bold ml-1">
                    {media.avaliacao.toFixed(1)}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onInfo(media);
                }}
                className="bg-black/50 p-2 rounded-full"
                disabled={actionLoading}
              >
                <Info width={14} height={14} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Botão de play central */}
            <View className="flex-1 items-center justify-center">
              <View className="bg-white/20 p-4 rounded-full">
                <Play width={24} height={24} fill="#fff" />
              </View>
            </View>

            {/* Footer com informações */}
            <View className="p-2 space-y-1">
              <Text className="text-white font-bold text-sm" numberOfLines={2}>
                {media.title}
              </Text>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center space-x-1">
                  <Calendar width={12} height={12} color="#ccc" />
                  <Text className="text-gray-300 text-xs">{media.anoLancamento}</Text>
                </View>
                <View className="flex-row items-center space-x-1">
                  <MediaIcon width={12} height={12} color="#ccc" />
                  <Text className="text-gray-300 text-xs">{mediaInfo.duration}</Text>
                </View>
              </View>

              {/* Categorias */}
              <View>
                <Text className="text-gray-400 text-xs" numberOfLines={1}>
                  {media.categoria.slice(0, 2).map((categoria, index) => (
                    CATEGORIA_LABELS[categoria] + (index < Math.min(media.categoria.length, 2) - 1 ? ", " : "")
                  )).join('')}
                </Text>
              </View>

              {/* Informações extras */}
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-400 text-xs" numberOfLines={1}>
                  {mediaInfo.extra}
                </Text>
                <View className="flex-row items-center space-x-1">
                  <Text className="text-red-500">❤️</Text>
                  <Text className="text-red-500 text-xs">{media.totalLikes}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Informações básicas sempre visíveis */}
          <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-300 text-xs">{media.anoLancamento}</Text>
              <View className="flex-row items-center space-x-1">
                <Text className="text-red-500">❤️</Text>
                <Text className="text-red-500 text-xs">{media.totalLikes}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};