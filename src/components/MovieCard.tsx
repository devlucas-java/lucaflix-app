import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';
import type {
  AnimeSimpleDTO,
  MovieSimpleDTO,
  SerieSimpleDTO,
} from '../types/mediaTypes';
import { Type } from '../types/mediaTypes';
import { CATEGORIA_LABELS } from '../types/mediaTypes';

// Custom SVG Icons
const PlayIcon = ({ width = 20, height = 20, fill = "#fff" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill={fill}>
    <Polygon points="5,3 19,12 5,21" />
  </Svg>
);

const InfoIcon = ({ width = 20, height = 20, color = "#fff" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </Svg>
);

const StarIcon = ({ width = 16, height = 16, fill = "#fff" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill={fill}>
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </Svg>
);

const ThumbsUpIcon = ({ width = 16, height = 16, color = "#fff" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
  </Svg>
);

const ClockIcon = ({ width = 16, height = 16, color = "#fff" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <Path d="M12 6v6l4 2"/>
  </Svg>
);

const TvIcon = ({ width = 16, height = 16, color = "#fff" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Path d="M20 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z"/>
    <Path d="M7 2l5 5 5-5"/>
  </Svg>
);

interface MovieCardProps {
  media: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO;
  onInfo: (media: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO) => void;
  isLarge?: boolean;
  isTop10?: boolean;
  top10Position?: number;
  size?: "P" | "M" | "G";
  loading?: boolean;
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

  // Dimensões menores e mais proporcionais
  const getDimensions = () => {
    if (isLarge) {
      return { width: 160, height: 240 };
    }

    switch (size) {
      case "P":
        return { width: 100, height: 150 };
      case "G":
        return { width: 140, height: 210 };
      default:
        return { width: 120, height: 180 };
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
        IconComponent: ClockIcon,
      };
    }

    switch (media.type) {
      case Type.MOVIE:
        return {
          duration: `${(media as MovieSimpleDTO).duracaoMinutos}min`,
          type: "Filme",
          extra: (media as MovieSimpleDTO).paisOrigen,
          IconComponent: ClockIcon,
        };
      case Type.SERIE:
        const serie = media as SerieSimpleDTO;
        return {
          duration: `${serie.totalTemporadas}T`,
          type: "Série",
          extra: `${serie.totalEpisodios} eps`,
          IconComponent: TvIcon,
        };
      case Type.ANIME:
        const anime = media as AnimeSimpleDTO;
        return {
          duration: `${anime.totalTemporadas}T`,
          type: "Anime",
          extra: `${anime.totalEpisodios} eps`,
          IconComponent: TvIcon,
        };
      default:
        return {
          duration: "N/A",
          type: "Desconhecido",
          extra: "",
          IconComponent: ClockIcon,
        };
    }
  };

  const currentImageUrl = getCurrentImageUrl();
  const mediaInfo = getMediaInfo();
  const MediaIconComponent = mediaInfo.IconComponent;
  const dimensions = getDimensions();

  // Render do skeleton quando em loading
  if (loading) {
    return (
      <View className="relative flex-shrink-0 mx-0">
        {/* Número do Top 10 (skeleton) */}
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
          className="bg-gray-700 rounded-lg"
          style={dimensions}
        >
          {/* Skeleton da imagem */}
          <View className="w-full h-full bg-gray-600 rounded-lg" />
          
          {/* Skeleton do overlay */}
          <View className="absolute inset-0 p-2">
            <View className="flex-row justify-between items-start mb-2">
              <View className="w-12 h-6 bg-gray-500 rounded" />
              <View className="w-8 h-8 bg-gray-500 rounded-full" />
            </View>
            
            <View className="flex-1 justify-end">
              <View className="h-4 bg-gray-500 rounded mb-2" />
              <View className="h-3 bg-gray-500 rounded w-3/4" />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={`relative flex-shrink-0 ${isTop10 ? 'mx-4' : 'mx-0'}`}>
      {/* Número do Top 10 - Posicionado atrás do card */}
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
        {/* Loading da ação no card */}
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
              onLoad={handleImageLoad}
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

          {/* Overlay de hover/press */}
          <View className="absolute inset-0 bg-black/60 rounded-lg opacity-0 active:opacity-100">
            {/* Header com rating */}
            <View className="flex-row justify-between items-start p-2">
              {media.avaliacao != null && (
                <View className="bg-yellow-500 px-2 py-1 rounded-full flex-row items-center">
                  <StarIcon width={10} height={10} fill="#000" />
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
                <InfoIcon width={12} height={12} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Botão de play central */}
            <View className="flex-1 items-center justify-center">
              <View className="bg-white/20 p-3 rounded-full">
                <PlayIcon width={20} height={20} fill="#fff" />
              </View>
            </View>

            {/* Footer com informações */}
            <View className="p-2">
              <Text className="text-white font-bold text-sm mb-1" numberOfLines={2}>
                {media.title}
              </Text>

              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center">
                  <MediaIconComponent width={10} height={10} color="#ccc" />
                  <Text className="text-gray-300 text-xs ml-1">{mediaInfo.duration}</Text>
                </View>
              </View>

              {/* Categorias */}
              <Text className="text-gray-400 text-xs mb-1" numberOfLines={1}>
                {media.categoria.slice(0, 2).map((categoria, index) => (
                  CATEGORIA_LABELS[categoria] + (index < Math.min(media.categoria.length, 2) - 1 ? ", " : "")
                )).join('')}
              </Text>

              {/* Informações extras */}
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-400 text-xs" numberOfLines={1}>
                  {mediaInfo.extra}
                </Text>
              </View>
            </View>
          </View>

          {/* Informações básicas sempre visíveis */}
          <View className="absolute bottom-0 left-0 right-0 p-2 bg-black/80 rounded-b-lg">
            <View className="flex-row items-center justify-between">
              {/* Avaliação no lado esquerdo */}
              {media.avaliacao != null && (
                <View className="flex-row items-center">
                  <StarIcon width={12} height={12} fill="#EAB308" />
                  <Text className="text-yellow-500 text-xs ml-1 font-medium">
                    {media.avaliacao.toFixed(1)}
                  </Text>
                </View>
              )}

              {/* Likes no lado direito */}
              <View className="flex-row items-center">
                <ThumbsUpIcon width={12} height={12} color="#10B981" />
                <Text className="text-emerald-500 text-xs ml-1">
                  {media.totalLikes}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};