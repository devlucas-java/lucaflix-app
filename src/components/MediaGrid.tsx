import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MovieCard } from '../components/MovieCard';
import { 
  type PaginatedResponseDTO, 
  type MovieSimpleDTO, 
  type SerieSimpleDTO, 
  type AnimeSimpleDTO,
} from '../types/mediaTypes';

interface MediaGridProps {
  data: PaginatedResponseDTO<MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO> | null;
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
  const [loadingMore, setLoadingMore] = useState(false);

  const getGridConfig = () => {
    switch (gridSize) {
      case 'small':
        return { numColumns: 3, cardSize: 'P' as const };
      case 'large':
        return { numColumns: 2, cardSize: 'G' as const };
      default:
        return { numColumns: 2, cardSize: 'M' as const };
    }
  };

  const gridConfig = getGridConfig();

  const renderGridItem = ({ item }: { item: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO }) => (
    <View className="flex-1 items-center mb-4">
      <MovieCard
        media={item}
        isLarge={gridConfig.cardSize === 'G'}
        size={gridConfig.cardSize}
        onPress={() => onMediaInfo(item)}
      />
    </View>
  );

  const renderLoadingSkeleton = () => (
    <FlatList
      data={Array.from({ length: 10 })}
      numColumns={gridConfig.numColumns}
      renderItem={({ index }) => (
        <View className="flex-1 mx-2 mb-4">
          <View 
            className="bg-gray-800 rounded-lg animate-pulse"
            style={{ 
              height: gridConfig.cardSize === 'G' ? 210 : gridConfig.cardSize === 'P' ? 150 : 180,
              aspectRatio: 2/3
            }}
          />
        </View>
      )}
      keyExtractor={(_, index) => `skeleton-${index}`}
      contentContainerStyle={{ padding: 16 }}
    />
  );

  const loadMore = async () => {
    if (data && data.hasNext && !loadingMore) {
      setLoadingMore(true);
      await onPageChange(data.currentPage + 1);
      setLoadingMore(false);
    }
  };

  const renderPagination = () => {
    if (!data || data.totalPages <= 1) return null;

    const { currentPage, totalPages } = data;
    const pages = [];
    
    // Mostrar algumas páginas ao redor da atual
    const start = Math.max(0, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <View className="items-center py-6">
        <Text className="text-gray-400 text-sm mb-4">
          Página {currentPage + 1} de {totalPages} • {data.totalElements} resultados
        </Text>
        
        <View className="flex-row items-center space-x-2">
          {/* Primeira página */}
          {currentPage > 0 && (
            <TouchableOpacity
              onPress={() => onPageChange(0)}
              className="bg-gray-800 px-3 py-2 rounded-lg"
            >
              <Text className="text-white text-sm">1</Text>
            </TouchableOpacity>
          )}
          
          {/* Reticências */}
          {start > 1 && (
            <Text className="text-gray-500 px-2">...</Text>
          )}
          
          {/* Páginas ao redor */}
          {pages.map(page => (
            <TouchableOpacity
              key={page}
              onPress={() => onPageChange(page)}
              className={`px-3 py-2 rounded-lg ${
                page === currentPage ? 'bg-red-600' : 'bg-gray-800'
              }`}
            >
              <Text className={`text-sm ${
                page === currentPage ? 'text-white font-semibold' : 'text-gray-300'
              }`}>
                {page + 1}
              </Text>
            </TouchableOpacity>
          ))}
          
          {/* Reticências */}
          {end < totalPages - 2 && (
            <Text className="text-gray-500 px-2">...</Text>
          )}
          
          {/* Última página */}
          {currentPage < totalPages - 1 && end < totalPages - 1 && (
            <TouchableOpacity
              onPress={() => onPageChange(totalPages - 1)}
              className="bg-gray-800 px-3 py-2 rounded-lg"
            >
              <Text className="text-white text-sm">{totalPages}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-black">
      {/* Header com contador */}
      {data && (
        <View className="px-4 py-3 border-b border-gray-800">
          <Text className="text-gray-400 text-sm">
            {data.totalElements} {data.totalElements === 1 ? 'resultado' : 'resultados'}
          </Text>
        </View>
      )}

      {/* Conteúdo */}
      {loading && !data ? (
        renderLoadingSkeleton()
      ) : data?.content.length ? (
        <>
          <FlatList
            data={data.content}
            numColumns={gridConfig.numColumns}
            renderItem={renderGridItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ 
              padding: 16,
              paddingBottom: 100
            }}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={() => (
              loadingMore ? (
                <View className="py-4 flex-row justify-center">
                  <ActivityIndicator size="small" color="#E50914" />
                  <Text className="text-gray-400 ml-2">Carregando mais...</Text>
                </View>
              ) : null
            )}
          />
          {renderPagination()}
        </>
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Icon name="search-off" size={64} color="#374151" />
          <Text className="text-gray-400 text-lg text-center mb-2">
            Nenhum resultado encontrado
          </Text>
          <Text className="text-gray-600 text-sm text-center">
            Tente ajustar seus critérios de busca
          </Text>
        </View>
      )}
    </View>
  );
};