import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import type { MovieSimpleDTO, SerieSimpleDTO, AnimeSimpleDTO } from '../types/mediaTypes';
import { MovieCard } from './MovieCard';

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

  // Calcular largura do card baseado nas props
  const getCardWidth = useCallback(() => {
    if (isBanner) {
      return isBigCard || isLarge ? 300 : 200;
    }
    return isBigCard || isLarge ? 180 : 140;
  }, [isBigCard, isLarge, isBanner]);

  const cardWidth = getCardWidth();

  // Handler de scroll para load more
  const handleScroll = useCallback((event: any) => {
    // Trigger load more quando próximo do final
    if (hasMore && onLoadMore && !loadingMore) {
      const { contentSize, contentOffset, layoutMeasurement } = event.nativeEvent;
      const isCloseToEnd = contentOffset.x + layoutMeasurement.width >= contentSize.width - 200;
      
      if (isCloseToEnd) {
        onLoadMore();
      }
    }
  }, [hasMore, onLoadMore, loadingMore]);

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
        className="bg-gray-700 rounded-lg"
        style={{
          width: cardWidth,
          height: isBanner ? 120 : (isBigCard || isLarge ? 270 : 210),
          marginRight: isTop10 ? 20 : 6, // Espaçamento lateral maior para Top 10
        }}
      >
        <View className="p-2">
          <View className="h-4 bg-gray-600 rounded mb-2" />
          <View className="h-3 bg-gray-600 rounded w-3/4" />
        </View>
      </View>
    ));
  };

  // Estado de loading completo
  const renderLoadingState = () => (
    <View className="w-full mb-6">
      <View className="flex-row items-center justify-between mb-3 px-4">
        <Text className="text-lg font-semibold text-white">
          {title}
        </Text>
      </View>
      
      <View className="flex-row px-4">
        {renderLoadingSkeleton()}
      </View>
    </View>
  );

  // Empty state
  const renderEmptyState = () => (
    <View className="w-full px-4 py-6 mb-6">
      <View className="flex-row items-center justify-between mb-3">
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
      <View className="bg-gray-800/20 rounded-lg border border-gray-700 py-8 items-center">
        <Text className="text-5xl opacity-50 mb-2">🎬</Text>
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
    <View className={`relative w-full mb-6 ${isBanner ? '-mt-32' : ''}`}>
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
        <View className="flex-row items-center gap-0">
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

      {/* Movies Container */}
      <View className={`px-1 ${isBanner ? 'relative z-10' : ''}`}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          className="py-2 w-[100vh]"
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
                style={{ 
                  width: cardWidth,
                  marginRight: isTop10 ? 20 : 6 // Espaçamento lateral maior para Top 10
                }}
              >
                <MovieCard
                  media={movie}
                  isLarge={isLarge || isBigCard}
                  isTop10={isTop10}
                  top10Position={isTop10 ? index + 1 : undefined}
                  onInfo={onInfo}
                  size={isBigCard || isLarge ? "G" : "M"}
                  loading={false}
                />
              </View>
            );
          })}
          
          {/* Loading skeletons quando carregando mais conteúdo */}
          {loadingMore && renderLoadingSkeleton()}
          
          {/* Indicador de fim do conteúdo */}
          {!hasMore && totalCount !== undefined && movies.length >= totalCount && (
            <View 
              className="items-center justify-center bg-gray-800/20 rounded-lg border border-gray-600"
              style={{
                width: cardWidth,
                height: isBanner ? 120 : (isBigCard || isLarge ? 270 : 210),
                marginRight: isTop10 ? 20 : 6, // Espaçamento lateral maior para Top 10
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
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-transparent" />
      )}
    </View>
  );
};