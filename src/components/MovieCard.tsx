import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';
import type {
  AnimeSimpleDTO,
  MovieSimpleDTO,
  SerieSimpleDTO,
} from '../types/mediaTypes';
import { Type } from '../types/mediaTypes';
import { CATEGORIA_LABELS } from '../types/mediaTypes';

// Custom SVG Icons
const PlayIcon = ({ width = 24, height = 24, fill = "#fff" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill={fill}>
    <Polygon points="5,3 19,12 5,21" />
  </Svg>
);

const InfoIcon = ({ width = 24, height = 24, color = "#fff" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </Svg>
);

const StarIcon = ({ width = 24, height = 24, fill = "#fff" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill={fill}>
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </Svg>
);

const CalendarIcon = ({ width = 24, height = 24, color = "#fff" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
    <Path d="M16 2v4M8 2v4M3 10h18"/>
  </Svg>
);

const ClockIcon = ({ width = 24, height = 24, color = "#fff" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <Path d="M12 6v6l4 2"/>
  </Svg>
);

const TvIcon = ({ width = 24, height = 24, color = "#fff" }) => (
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
          duration: `${serie.totalTemporadas} temporada${serie.totalTemporadas > 1 ? "s" : ""}`,
          type: "Série",
          extra: `${serie.totalEpisodios} episódios`,
          IconComponent: TvIcon,
        };
      case Type.ANIME:
        const anime = media as AnimeSimpleDTO;
        return {
          duration: `${anime.totalTemporadas} temporada${anime.totalTemporadas > 1 ? "s" : ""}`,
          type: "Anime",
          extra: `${anime.totalEpisodios} episódios`,
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
      <View style={[styles.cardContainer, { marginLeft: isTop10 ? 60 : 4 }]}>
        {/* Número do Top 10 (skeleton) */}
        {isTop10 && top10Position && (
          <View 
            style={[
              styles.top10Container,
              {
                left: -120,
                top: 0,
                width: dimensions.width,
                height: dimensions.height,
              }
            ]}
          >
            <View 
              style={[
                styles.skeletonTop10,
                {
                  width: dimensions.width * 0.6,
                  height: dimensions.height * 0.8,
                }
              ]}
            />
          </View>
        )}

        <View style={[styles.skeletonCard, dimensions]}>
          {/* Skeleton da imagem */}
          <View style={styles.skeletonImage} />
          
          {/* Skeleton do overlay */}
          <View style={styles.skeletonOverlay}>
            <View style={styles.skeletonHeader}>
              <View style={styles.skeletonRating} />
              <View style={styles.skeletonIcon} />
            </View>
            
            <View style={styles.skeletonFooter}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonSubtitle} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.cardContainer, { marginLeft: isTop10 ? 60 : 4 }]}>
      {/* Número do Top 10 */}
      {isTop10 && top10Position && (
        <View 
          style={[
            styles.top10Container,
            {
              left: -120,
              top: 0,
              width: dimensions.width,
              height: dimensions.height,
            }
          ]}
        >
          <Text 
            style={[
              styles.top10Text,
              {
                fontSize: dimensions.height * 0.8,
                lineHeight: dimensions.height,
              }
            ]}
          >
            {top10Position}
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={handleCardPress}
        activeOpacity={0.8}
        style={[styles.cardButton, dimensions]}
        disabled={actionLoading}
      >
        {/* Loading da ação no card */}
        {actionLoading && (
          <View style={styles.actionLoading}>
            <ActivityIndicator size="large" color="#E50914" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        )}

        {/* Container da imagem */}
        <View style={[styles.imageContainer, dimensions]}>
          {/* Imagem */}
          {currentImageUrl && !imageError ? (
            <Image
              source={{ uri: currentImageUrl }}
              style={[styles.image, dimensions]}
              onError={handleImageError}
              onLoad={handleImageLoad}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText} numberOfLines={3}>
                {media.title}
              </Text>
            </View>
          )}

          {/* Loading da imagem */}
          {currentImageUrl && !imageLoaded && !imageError && (
            <View style={styles.imageLoading}>
              <ActivityIndicator size="small" color="#E50914" />
              <Text style={styles.imageLoadingText}>Carregando imagem...</Text>
            </View>
          )}

          {/* Overlay de hover/press */}
          <View style={styles.overlay}>
            {/* Header com rating */}
            <View style={styles.overlayHeader}>
              {media.avaliacao != null && (
                <View style={styles.ratingContainer}>
                  <StarIcon width={10} height={10} fill="#000" />
                  <Text style={styles.ratingText}>
                    {media.avaliacao.toFixed(1)}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onInfo(media);
                }}
                style={styles.infoButton}
                disabled={actionLoading}
              >
                <InfoIcon width={14} height={14} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Botão de play central */}
            <View style={styles.playButtonContainer}>
              <View style={styles.playButton}>
                <PlayIcon width={24} height={24} fill="#fff" />
              </View>
            </View>

            {/* Footer com informações */}
            <View style={styles.overlayFooter}>
              <Text style={styles.title} numberOfLines={2}>
                {media.title}
              </Text>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <CalendarIcon width={12} height={12} color="#ccc" />
                  <Text style={styles.infoText}>{media.anoLancamento}</Text>
                </View>
                <View style={styles.infoItem}>
                  <MediaIconComponent width={12} height={12} color="#ccc" />
                  <Text style={styles.infoText}>{mediaInfo.duration}</Text>
                </View>
              </View>

              {/* Categorias */}
              <View>
                <Text style={styles.categoryText} numberOfLines={1}>
                  {media.categoria.slice(0, 2).map((categoria, index) => (
                    CATEGORIA_LABELS[categoria] + (index < Math.min(media.categoria.length, 2) - 1 ? ", " : "")
                  )).join('')}
                </Text>
              </View>

              {/* Informações extras */}
              <View style={styles.extraInfoRow}>
                <Text style={styles.extraInfoText} numberOfLines={1}>
                  {mediaInfo.extra}
                </Text>
                <View style={styles.likesContainer}>
                  <Text style={styles.heartIcon}>❤️</Text>
                  <Text style={styles.likesText}>{media.totalLikes}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Informações básicas sempre visíveis */}
          <View style={styles.basicInfo}>
            <View style={styles.basicInfoRow}>
              <Text style={styles.basicInfoYear}>{media.anoLancamento}</Text>
              <View style={styles.basicInfoLikes}>
                <Text style={styles.heartIcon}>❤️</Text>
                <Text style={styles.likesText}>{media.totalLikes}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
    flexShrink: 0,
    marginHorizontal: 4,
  },
  top10Container: {
    position: 'absolute',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  top10Text: {
    fontWeight: '900',
    color: 'rgba(209, 213, 219, 0.8)',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  skeletonCard: {
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  skeletonImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4B5563',
    borderRadius: 8,
  },
  skeletonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 8,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  skeletonRating: {
    width: 48,
    height: 24,
    backgroundColor: '#6B7280',
    borderRadius: 4,
  },
  skeletonIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#6B7280',
    borderRadius: 16,
  },
  skeletonFooter: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: '#6B7280',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 12,
    backgroundColor: '#6B7280',
    borderRadius: 4,
    width: '75%',
  },
  skeletonTop10: {
    backgroundColor: '#4B5563',
    borderRadius: 4,
  },
  cardButton: {
    position: 'relative',
  },
  actionLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
  },
  loadingText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  image: {
    borderRadius: 8,
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  placeholderText: {
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 8,
    fontSize: 14,
  },
  imageLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    borderRadius: 8,
  },
  imageLoadingText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    opacity: 0,
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 8,
  },
  ratingContainer: {
    backgroundColor: '#EAB308',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  infoButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 16,
  },
  playButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 32,
  },
  overlayFooter: {
    padding: 8,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: '#D1D5DB',
    fontSize: 12,
    marginLeft: 4,
  },
  categoryText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  extraInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  extraInfoText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartIcon: {
    color: '#EF4444',
    fontSize: 12,
  },
  likesText: {
    color: '#EF4444',
    fontSize: 12,
    marginLeft: 4,
  },
  basicInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  basicInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  basicInfoYear: {
    color: '#D1D5DB',
    fontSize: 12,
  },
  basicInfoLikes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});