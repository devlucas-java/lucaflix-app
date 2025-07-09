import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'react-native-svg';
import { MovieCard } from '../components/MovieCard';
import { 
  type PaginatedResponseDTO, 
  type MovieSimpleDTO, 
  type SerieSimpleDTO, 
  type AnimeSimpleDTO,
} from '../types/mediaTypes';

interface MediaGridProps {
  data: PaginatedResponseDTO<MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO> | undefined;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onMediaInfo: (media: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO) => void;
  gridSize?: 'small' | 'medium' | 'large';
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  data,
  loading = false,
  onPageChange,
  onMediaInfo,
  gridSize = 'medium'
}) => {
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  useEffect(() => {
    console.log({onMediaInfo})
  }, [onMediaInfo]);

  const getGridConfig = () => {
    switch (gridSize) {
      case 'small':
        return {
          numColumns: 3,
          cardSize: 'P' as const,
          spacing: 8
        };
      case 'large':
        return {
          numColumns: 2,
          cardSize: 'G' as const,
          spacing: 16
        };
      default:
        return {
          numColumns: 2,
          cardSize: 'M' as const,
          spacing: 12
        };
    }
  };

  const gridConfig = getGridConfig();

  // Renderizar item do grid
  const renderGridItem = ({ item, index }: { item: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO, index: number }) => {
    return (
      <View className="flex-1 items-center" style={{ marginBottom: gridConfig.spacing }}>
        <MovieCard
          media={item}
          isLarge={gridConfig.cardSize === 'G'}
          isTop10={false}
          onInfo={onMediaInfo}
          size={gridConfig.cardSize}
        />
      </View>
    );
  };

  // Renderizar paginação
  const renderPagination = () => {
    if (!data || data.totalPages <= 1) return null;

    const { currentPage, totalPages, hasNext, hasPrevious } = data;
    
    const getPageRange = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      range.push(0);

      const start = Math.max(1, currentPage - delta);
      const end = Math.min(totalPages - 2, currentPage + delta);

      for (let i = start; i <= end; i++) {
        range.push(i);
      }

      if (totalPages > 1) {
        range.push(totalPages - 1);
      }

      const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

      for (let i = 0; i < uniqueRange.length; i++) {
        if (i > 0 && uniqueRange[i] - uniqueRange[i - 1] > 1) {
          rangeWithDots.push('...');
        }
        rangeWithDots.push(uniqueRange[i]);
      }

      return rangeWithDots;
    };

    const pageRange = getPageRange();

    return (
      <View className="items-center space-y-4 mt-6 px-4">
        {/* Informações da paginação */}
        <Text className="text-gray-400 text-sm text-center">
          Página {currentPage + 1} de {totalPages} • {data.totalElements} resultados
        </Text>

        {/* Controles de paginação */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex-row"
          contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 16 }}
        >
          {/* Primeira página */}
          <TouchableOpacity
            onPress={() => onPageChange(0)}
            disabled={currentPage === 0}
            className={`px-3 py-2 mx-1 rounded-lg bg-gray-800 ${currentPage === 0 ? 'opacity-30' : ''}`}
          >
            <Text className="text-white text-sm">««</Text>
          </TouchableOpacity>

          {/* Página anterior */}
          <TouchableOpacity
            onPress={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevious}
            className={`px-3 py-2 mx-1 rounded-lg bg-gray-800 flex-row items-center ${!hasPrevious ? 'opacity-30' : ''}`}
          >
            <ChevronLeft width={16} height={16} color="#fff" />
            <Text className="text-white text-sm ml-1">Ant</Text>
          </TouchableOpacity>

          {/* Números das páginas */}
          {pageRange.map((page, index) => (
            <View key={index} className="mx-1">
              {page === '...' ? (
                <View className="px-2 py-2">
                  <MoreHorizontal width={16} height={16} color="#666" />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => onPageChange(page as number)}
                  className={`px-3 py-2 rounded-lg ${
                    page === currentPage ? 'bg-red-600' : 'bg-gray-800'
                  }`}
                >
                  <Text 
                    className={`text-sm ${
                      page === currentPage ? 'text-white font-semibold' : 'text-gray-300'
                    }`}
                  >
                    {(page as number) + 1}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Próxima página */}
          <TouchableOpacity
            onPress={() => onPageChange(currentPage + 1)}
            disabled={!hasNext}
            className={`px-3 py-2 mx-1 rounded-lg bg-gray-800 flex-row items-center ${!hasNext ? 'opacity-30' : ''}`}
          >
            <Text className="text-white text-sm mr-1">Próx</Text>
            <ChevronRight width={16} height={16} color="#fff" />
          </TouchableOpacity>

          {/* Última página */}
          <TouchableOpacity
            onPress={() => onPageChange(totalPages - 1)}
            disabled={currentPage === totalPages - 1}
            className={`px-3 py-2 mx-1 rounded-lg bg-gray-800 ${currentPage === totalPages - 1 ? 'opacity-30' : ''}`}
          >
            <Text className="text-white text-sm">»»</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  // Renderizar loading skeleton
  const renderLoadingSkeleton = () => (
    <FlatList
      data={Array.from({ length: 20 })}
      numColumns={gridConfig.numColumns}
      renderItem={({ index }) => (
        <View 
          className="flex-1 mx-2 mb-4 bg-gray-800 rounded-lg animate-pulse"
          style={{ 
            height: gridConfig.cardSize === 'G' ? 270 : gridConfig.cardSize === 'P' ? 180 : 210,
            aspectRatio: 2/3
          }}
        />
      )}
      keyExtractor={(_, index) => `skeleton-${index}`}
      contentContainerStyle={{ padding: 16 }}
    />
  );

  return (
    <View className="flex-1 bg-black">
      {/* Header com contador */}
      <View className="flex-row items-center justify-between px-4 py-2">
        {data && (
          <Text className="text-gray-400 text-sm">
            {data.totalElements} {data.totalElements === 1 ? 'resultado' : 'resultados'}
          </Text>
        )}
      </View>

      {/* Conteúdo */}
      <View className="flex-1 min-h-96">
        {loading ? (
          renderLoadingSkeleton()
        ) : data?.content.length ? (
          <>
            <FlatList
              data={data.content}
              numColumns={gridConfig.numColumns}
              renderItem={renderGridItem}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              contentContainerStyle={{ 
                padding: 16,
                paddingBottom: 100 // Espaço para paginação
              }}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: gridConfig.spacing }} />}
            />
            {renderPagination()}
          </>
        ) : (
          /* Estado vazio */
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-gray-400 text-lg text-center mb-2">
              Nenhum resultado encontrado
            </Text>
            <Text className="text-gray-600 text-sm text-center">
              Tente ajustar seus critérios de busca
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};