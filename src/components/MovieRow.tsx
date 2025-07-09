import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { MovieSimpleDTO, SerieSimpleDTO, AnimeSimpleDTO } from '../types/mediaTypes';
import { MovieCard } from './MovieCard';

const { width } = Dimensions.get('window');

// Custom SVG Icons
const ChevronLeft = ({ size = 24, color = "#fff" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Path d="M15 18l-6-6 6-6" />
  </Svg>
);

const ChevronRight = ({ size = 24, color = "#fff" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

interface MovieRowProps {
  title: string;
  movies: (MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO)[];
  isTop10?: boolean;
  isBigCard?: boolean;
  isBanner?: boolean;
  isLarge?: boolean;
  totalCount?: number;
  onInfo: (media: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO) => void;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
}

export const MovieRow: React.FC<MovieRowProps> = ({ 
  title, 
  movies,
  isTop10 = false,
  isBigCard = false,
  isBanner = false,
  isLarge = false,
  totalCount,
  onInfo,
  loading = false,
  hasMore = false,
  onLoadMore,
  loadingMore = false
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [canScroll, setCanScroll] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);
  const [scrollViewWidth, setScrollViewWidth] = useState(0);

  // Calcular largura do card baseado nas props
  const getCardWidth = useCallback(() => {
    if (isBanner) {
      return isBigCard || isLarge ? 300 : 200;
    }
    return isBigCard || isLarge ? 180 : 140;
  }, [isBigCard, isLarge, isBanner]);

  const cardWidth = getCardWidth();
  const cardSpacing = 12;

  // Atualizar visibilidade das setas
  const updateArrowVisibility = useCallback((scrollX: number) => {
    const totalContentWidth = movies.length * (cardWidth + cardSpacing);
    const hasOverflow = totalContentWidth > scrollViewWidth;
    
    setCanScroll(hasOverflow);
    setShowLeftArrow(hasOverflow && scrollX > 5);
    setShowRightArrow(hasOverflow && scrollX < totalContentWidth - scrollViewWidth - 5);
  }, [movies.length, cardWidth, cardSpacing, scrollViewWidth]);

  // Effect para atualizar setas quando movies mudam
  useEffect(() => {
    updateArrowVisibility(0);
  }, [movies, updateArrowVisibility]);

  // Função de scroll
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current || !canScroll) return;

    const scrollAmount = cardWidth * 3 + cardSpacing * 3; // 3 cards por vez
    
    scrollRef.current.scrollTo({
      x: direction === 'left' ? -scrollAmount : scrollAmount,
      animated: true,
    });
  }, [canScroll, cardWidth, cardSpacing]);

  // Handler de scroll
  const handleScroll = useCallback((event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    updateArrowVisibility(scrollX);
    
    // Trigger load more quando próximo do final
    if (hasMore && onLoadMore && !loadingMore) {
      const { contentSize, contentOffset, layoutMeasurement } = event.nativeEvent;
      const isCloseToEnd = contentOffset.x + layoutMeasurement.width >= contentSize.width - 200;
      
      if (isCloseToEnd) {
        onLoadMore();
      }
    }
  }, [updateArrowVisibility, hasMore, onLoadMore, loadingMore]);

  // Função para formatar o contador
  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Loading skeleton para novos itens
  const renderLoadingSkeleton = () => {
    const skeletonCount = 4;
    return Array.from({ length: skeletonCount }).map((_, index) => (
      <View 
        key={`skeleton-${index}`}
        style={[
          styles.skeletonCard,
          {
            width: cardWidth,
            height: isBanner ? 120 : (isBigCard || isLarge ? 270 : 210),
            marginRight: 12,
          }
        ]}
      >
        <View style={styles.skeletonContent}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonSubtitle} />
        </View>
      </View>
    ));
  };

  // Estado de loading completo
  const renderLoadingState = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {title}
          {isTop10 && (
            <Text style={styles.subtitle}>
              {' '}Hoje no Brasil
            </Text>
          )}
        </Text>
      </View>
      
      <View style={styles.loadingRow}>
        {renderLoadingSkeleton()}
      </View>
    </View>
  );

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {title}
          {isTop10 && (
            <Text style={styles.subtitle}>
              {' '}Hoje no Brasil
            </Text>
          )}
        </Text>
        <Text style={styles.emptyCount}>
          0 itens
        </Text>
      </View>
      <View style={styles.emptyStateCard}>
        <Text style={styles.emptyIcon}>🎬</Text>
        <Text style={styles.emptyText}>Nenhum conteúdo disponível</Text>
      </View>
    </View>
  );

  // Loading state principal
  if (loading) {
    return renderLoadingState();
  }

  // Empty state
  if (!movies || movies.length === 0) {
    return renderEmptyState();
  }

  return (
    <View style={[styles.rowContainer, isBanner && styles.bannerRow]}>
      {/* Section Title */}
      <View style={[styles.header, isBanner && styles.bannerHeader]}>
        <Text style={styles.title}>
          {title}
          {isTop10 && (
            <Text style={styles.subtitle}>
              {' '}Hoje no Brasil
            </Text>
          )}
        </Text>
        
        {/* Contador de itens */}
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {formatCount(movies.length)}
            {totalCount !== undefined && totalCount > movies.length && (
              <Text>/{formatCount(totalCount)}</Text>
            )}
            {' '}
            {movies.length === 1 ? 'item' : 'itens'}
          </Text>
          
          {/* Indicador de carregamento */}
          {loadingMore && (
            <View style={styles.loadingIndicator}>
              <ActivityIndicator size="small" color="#60A5FA" />
              <Text style={styles.loadingText}>Carregando...</Text>
            </View>
          )}
        </View>
      </View>

      {/* Navigation Arrows */}
      {canScroll && (
        <>
          {/* Left Arrow */}
          {showLeftArrow && (
            <TouchableOpacity
              onPress={() => scroll('left')}
              style={[
                styles.arrowButton,
                styles.leftArrow,
                { top: isTop10 ? '58%' : '54%' }
              ]}
            >
              <ChevronLeft size={18} color="white" />
            </TouchableOpacity>
          )}

          {/* Right Arrow */}
          {showRightArrow && (
            <TouchableOpacity
              onPress={() => scroll('right')}
              style={[
                styles.arrowButton,
                styles.rightArrow,
                { top: isTop10 ? '58%' : '54%' }
              ]}
            >
              <ChevronRight size={18} color="white" />
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Movies Container */}
      <View style={[styles.moviesContainer, isBanner && styles.bannerMoviesContainer]}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={(width) => setContentWidth(width)}
          onLayout={(event) => {
            setScrollViewWidth(event.nativeEvent.layout.width);
          }}
          style={styles.scrollView}
        >
          {movies.map((movie, index) => {
            // Validação de movie
            if (!movie || !movie.id) {
              console.warn(`Movie inválido no índice ${index}:`, movie);
              return null;
            }

            return (
              <View 
                key={`${movie.id}-${index}`} 
                style={[styles.movieCardContainer, { width: cardWidth }]}
              >
                <MovieCard
                  media={movie}
                  isLarge={isLarge || isBigCard}
                  isTop10={isTop10}
                  top10Position={isTop10 ? index + 1 : undefined}
                  onInfo={onInfo}
                  size={isBigCard || isLarge ? "G" : "M"}
                  loading={false} // Cards individuais não ficam em loading
                />
              </View>
            );
          })}
          
          {/* Loading skeletons quando carregando mais conteúdo */}
          {loadingMore && renderLoadingSkeleton()}
          
          {/* Indicador de fim do conteúdo */}
          {!hasMore && totalCount !== undefined && movies.length >= totalCount && (
            <View 
              style={[
                styles.endIndicator,
                {
                  width: cardWidth,
                  height: isBanner ? 120 : (isBigCard || isLarge ? 270 : 210),
                }
              ]}
            >
              <Text style={styles.endIcon}>✨</Text>
              <Text style={styles.endText}>
                Todos os títulos{'\n'}carregados
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Gradiente para o banner sobrepor o hero section */}
      {isBanner && (
        <View style={styles.bannerGradient} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  rowContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  bannerRow: {
    marginTop: -128,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  bannerHeader: {
    position: 'relative',
    zIndex: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  subtitle: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'normal',
    color: '#9CA3AF',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterText: {
    fontSize: 12,
    color: '#6B7280',
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loadingText: {
    color: '#60A5FA',
    fontSize: 12,
  },
  emptyContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  emptyCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyStateCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    opacity: 0.5,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingRow: {
    flexDirection: 'row',
  },
  skeletonCard: {
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  skeletonContent: {
    padding: 8,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: '#4B5563',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 12,
    backgroundColor: '#4B5563',
    borderRadius: 4,
    width: '75%',
  },
  arrowButton: {
    position: 'absolute',
    zIndex: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.3)',
    transform: [{ translateY: -20 }],
  },
  leftArrow: {
    left: 8,
  },
  rightArrow: {
    right: 8,
  },
  moviesContainer: {
    paddingHorizontal: 16,
  },
  bannerMoviesContainer: {
    position: 'relative',
    zIndex: 10,
  },
  scrollView: {
    paddingVertical: 8,
  },
  movieCardContainer: {
    marginRight: 12,
  },
  endIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4B5563',
    marginRight: 12,
  },
  endIcon: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  endText: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
  },
  bannerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    // This would be a gradient in a real implementation
    // For now, it's just a transparent overlay
  },
});