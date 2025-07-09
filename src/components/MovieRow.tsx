import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'react-native-svg';
import type { MovieSimpleDTO, SerieSimpleDTO, AnimeSimpleDTO } from '../types/mediaTypes';
import { MovieCard } from './MovieCard';

const { width } = Dimensions.get('window');

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
        className="bg-gray-800 rounded-lg mr-3 animate-pulse"
        style={{
          width: cardWidth,
          height: isBanner ? 120 : (isBigCard || isLarge ? 270 : 210),
        }}
      >
        <View className="p-2">
          <View className="h-4 bg-gray-700 rounded mb-2" />
          <View className="h-3 bg-gray-700 rounded w-3/4" />
        </View>
      </View>
    ));
  };

  // Estado de loading completo
  const renderLoadingState = () => (
    <View className="px-4 mb-8">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-white text-xl font-bold">
          {title}
          {isTop10 && (
            <Text className="ml-2 text-sm font-normal text-gray-400">
              {' '}Hoje no Brasil
            </Text>
          )}
        </Text>
      </View>
      
      <View className="flex-row">
        {renderLoadingSkeleton()}
      </View>
    </View>
  );

  // Empty state
  const renderEmptyState = () => (
    <View className="px-4 py-6">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-white">
          {title}
          {isTop10 && (
            <Text className="ml-2 text-sm font-normal text-gray-400">
              {' '}Hoje no Brasil
            </Text>
          )}
        </Text>
        <Text className="text-xs text-gray-500">
          0 itens
        </Text>
      </View>
      <View className="bg-gray-900/20 rounded-lg border border-gray-800 py-8 items-center">
        <Text className="text-3xl mb-2 opacity-50">🎬</Text>
        <Text className="text-sm text-gray-500">Nenhum conteúdo disponível</Text>
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
    <View className={`relative ${isBanner ? '-mt-32' : ''} mb-6`}>
      {/* Section Title */}
      <View className={`flex-row items-center justify-between mb-3 px-4 ${isBanner ? 'relative z-10' : ''}`}>
        <Text className="text-lg font-semibold text-white">
          {title}
          {isTop10 && (
            <Text className="ml-2 text-sm font-normal text-gray-400">
              {' '}Hoje no Brasil
            </Text>
          )}
        </Text>
        
        {/* Contador de itens */}
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-gray-500">
            {formatCount(movies.length)}
            {totalCount !== undefined && totalCount > movies.length && (
              <Text>/{formatCount(totalCount)}</Text>
            )}
            {' '}
            {movies.length === 1 ? 'item' : 'itens'}
          </Text>
          
          {/* Indicador de carregamento */}
          {loadingMore && (
            <View className="flex-row items-center gap-1">
              <ActivityIndicator size="small" color="#60A5FA" />
              <Text className="text-blue-400 text-xs">Carregando...</Text>
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
              className="absolute left-2 top-1/2 z-40 bg-black/80 rounded-full p-2 border border-gray-600/30"
              style={{ 
                transform: [{ translateY: -20 }],
                top: isTop10 ? '58%' : '54%',
              }}
            >
              <ChevronLeft size={18} color="white" />
            </TouchableOpacity>
          )}

          {/* Right Arrow */}
          {showRightArrow && (
            <TouchableOpacity
              onPress={() => scroll('right')}
              className="absolute right-2 top-1/2 z-40 bg-black/80 rounded-full p-2 border border-gray-600/30"
              style={{ 
                transform: [{ translateY: -20 }],
                top: isTop10 ? '58%' : '54%',
              }}
            >
              <ChevronRight size={18} color="white" />
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Movies Container */}
      <View className={`px-4 ${isBanner ? 'relative z-10' : ''}`}>
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
          className="py-2"
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
                className="mr-3"
                style={{ width: cardWidth }}
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
              className="flex items-center justify-center bg-gray-900/20 rounded-lg border border-gray-700 mr-3"
              style={{
                width: cardWidth,
                height: isBanner ? 120 : (isBigCard || isLarge ? 270 : 210),
              }}
            >
              <Text className="text-gray-400 text-sm mb-2">✨</Text>
              <Text className="text-gray-500 text-xs text-center">
                Todos os títulos{'\n'}carregados
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Gradiente para o banner sobrepor o hero section */}
      {isBanner && (
        <View className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
      )}
    </View>
  );
};