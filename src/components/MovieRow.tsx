import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
} from 'react-native';
import type { MovieSimpleDTO, SerieSimpleDTO, AnimeSimpleDTO } from '../types/mediaTypes';
import { MovieCard } from './MovieCard';

interface MovieRowProps {
  title: string;
  movies: (MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO)[];
  isTop10?: boolean;
  isBigCard?: boolean;
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
  onInfo,
  loading = false,
  hasMore = false,
  onLoadMore,
  loadingMore = false
}) => {
  const scrollRef = useRef<ScrollView>(null);

  const cardWidth = isBigCard ? 180 : 140;

  // Handler de scroll para load more
  const handleScroll = useCallback((event: any) => {
    if (hasMore && onLoadMore && !loadingMore) {
      const { contentSize, contentOffset, layoutMeasurement } = event.nativeEvent;
      const isCloseToEnd = contentOffset.x + layoutMeasurement.width >= contentSize.width - 200;
      
      if (isCloseToEnd) {
        onLoadMore();
      }
    }
  }, [hasMore, onLoadMore, loadingMore]);

  // Loading skeleton
  const renderLoadingSkeleton = () => {
    const skeletonCount = 4;
    return Array.from({ length: skeletonCount }).map((_, index) => (
      <View 
        key={`skeleton-${index}`}
        className="bg-gray-700 rounded-lg mr-3"
        style={{
          width: cardWidth,
          height: isBigCard ? 270 : 210,
        }}
      />
    ));
  };

  // Loading state
  if (loading) {
    return (
      <View className="mb-6">
        <Text className="text-lg font-semibold text-white mb-3 px-4">
          {title}
        </Text>
        <View className="flex-row px-4">
          {renderLoadingSkeleton()}
        </View>
      </View>
    );
  }

  // Empty state
  if (!movies || movies.length === 0) {
    return (
      <View className="mb-6 px-4">
        <Text className="text-lg font-semibold text-white mb-3">
          {title}
        </Text>
        <View className="bg-gray-800/20 rounded-lg border border-gray-700 py-8 items-center">
          <Text className="text-5xl opacity-50 mb-2">🎬</Text>
          <Text className="text-sm text-gray-500">Nenhum conteúdo disponível</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-6">
      {/* Título */}
      <Text className="text-lg font-semibold text-white mb-3 px-4">
        {title}
      </Text>

      {/* Lista de filmes */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 16, paddingRight: 32 }}
      >
        {movies.map((movie, index) => {
          if (!movie || !movie.id) {
            return null;
          }

          return (
            <View 
              key={`${movie.id}-${index}`} 
              style={{ 
                width: cardWidth,
                marginRight: 12
              }}
            >
              <MovieCard
                media={movie}
                isLarge={isBigCard}
                isTop10={isTop10}
                top10Position={isTop10 ? index + 1 : undefined}
                onInfo={onInfo}
                size={isBigCard ? "G" : "M"}
                loading={false}
              />
            </View>
          );
        })}
        
        {/* Loading quando carregando mais */}
        {loadingMore && renderLoadingSkeleton()}
      </ScrollView>
    </View>
  );
};