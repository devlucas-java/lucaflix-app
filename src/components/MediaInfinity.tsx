import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MovieCard } from '../components/MovieCard';
import { 
  type PaginatedResponseDTO, 
  type MovieSimpleDTO, 
  type SerieSimpleDTO, 
  type AnimeSimpleDTO,
} from '../types/mediaTypes';

interface MediaInfinityProps {
  data: PaginatedResponseDTO<MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO> | null;
  loading?: boolean;
  loadingMore?: boolean; // Novo prop para indicar carregamento de mais itens
  onLoadMore: () => void; // Callback para carregar mais itens
  onMediaInfo: (media: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO) => void;
  gridSize?: 'small' | 'medium' | 'large';
  allItems?: (MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO)[]; // Todos os itens acumulados
}

const { width: screenWidth } = Dimensions.get('window');

export const MediaInfinity: React.FC<MediaInfinityProps> = ({
  data,
  loading = false,
  loadingMore = false,
  onLoadMore,
  onMediaInfo,
  gridSize = 'medium',
  allItems = []
}) => {

  // Logging para debug
  React.useEffect(() => {
    console.log('MediaInfinity - Loading state:', loading);
    console.log('MediaInfinity - LoadingMore state:', loadingMore);
    console.log('MediaInfinity - All items count:', allItems.length);
    console.log('MediaInfinity - Data available:', !!data);
    if (data) {
      console.log('MediaInfinity - Current page:', data.currentPage);
      console.log('MediaInfinity - Total pages:', data.totalPages);
      console.log('MediaInfinity - Has more pages:', data.currentPage < data.totalPages - 1);
    }
  }, [loading, loadingMore, data, allItems]);

  const getGridConfig = () => {
    const padding = 16;
    const spacing = 8;
    
    switch (gridSize) {
      case 'small':
        return { 
          numColumns: 4,
          cardSize: 'P' as const,
          itemWidth: (screenWidth - padding - (spacing * 3)) / 4
        };
      case 'large':
        return { 
          numColumns: 2, 
          cardSize: 'G' as const,
          itemWidth: (screenWidth - padding - spacing) / 2
        };
      default:
        return { 
          numColumns: 3, 
          cardSize: 'M' as const,
          itemWidth: (screenWidth - padding - (spacing * 2)) / 3
        };
    }
  };

  const gridConfig = getGridConfig();

  const renderGridItem = ({ item, index }: { item: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO, index: number }) => {
    console.log(`MediaInfinity - Rendering item ${index}:`, item.titulo);
    
    return (
      <View 
        className="mb-3" 
        style={{ 
          width: gridConfig.itemWidth,
          marginLeft: index % gridConfig.numColumns === 0 ? 0 : 4,
          marginRight: index % gridConfig.numColumns === gridConfig.numColumns - 1 ? 0 : 4,
        }}
      >
        <MovieCard
          media={item}
          isLarge={gridConfig.cardSize === 'G'}
          size={gridConfig.cardSize}
          onPress={() => onMediaInfo(item)}
          loading={false} // Cards reais nunca em loading
        />
      </View>
    );
  };

  // Renderiza skeleton cards para loading inicial
  const renderLoadingSkeleton = () => {
    console.log('MediaInfinity - Rendering initial loading skeleton (20 items)');
    
    return (
      <FlatList
        data={Array.from({ length: 20 })} // 20 skeleton cards
        numColumns={gridConfig.numColumns}
        renderItem={({ index }) => (
          <View 
            className="mb-3"
            style={{ 
              width: gridConfig.itemWidth,
              marginLeft: index % gridConfig.numColumns === 0 ? 0 : 4,
              marginRight: index % gridConfig.numColumns === gridConfig.numColumns - 1 ? 0 : 4,
            }}
          >
            <MovieCard
              media={{
                id: index,
                titulo: 'Loading...',
                title: 'Loading...',
                posterURL1: '',
                posterURL2: '',
                avaliacao: 0,
                totalLikes: 0
              } as any}
              isLarge={gridConfig.cardSize === 'G'}
              size={gridConfig.cardSize}
              loading={true} // Skeleton mode
              onPress={() => {}}
            />
          </View>
        )}
        keyExtractor={(_, index) => `skeleton-${index}`}
        contentContainerStyle={{ paddingHorizontal: 8, paddingTop: 8 }}
        scrollEnabled={false}
      />
    );
  };

  // Renderiza mais skeleton cards no final da lista
  const renderLoadMoreSkeleton = () => {
    if (!loadingMore) return null;
    
    console.log('MediaInfinity - Rendering load more skeleton');
    
    const skeletonCount = 6; // Menos cards para "load more"
    return Array.from({ length: skeletonCount }).map((_, index) => (
      <View 
        key={`load-more-skeleton-${index}`}
        className="mb-3"
        style={{ 
          width: gridConfig.itemWidth,
          marginLeft: index % gridConfig.numColumns === 0 ? 0 : 4,
          marginRight: index % gridConfig.numColumns === gridConfig.numColumns - 1 ? 0 : 4,
        }}
      >
        <MovieCard
          media={{
            id: `loading-${index}`,
            titulo: 'Loading...',
            title: 'Loading...',
            posterURL1: '',
            posterURL2: '',
            avaliacao: 0,
            totalLikes: 0
          } as any}
          isLarge={gridConfig.cardSize === 'G'}
          size={gridConfig.cardSize}
          loading={true} // Skeleton mode
          onPress={() => {}}
        />
      </View>
    ));
  };

  // Função chamada quando chega no final da lista
  const handleEndReached = () => {
    console.log('MediaInfinity - End reached');
    
    // Só carrega mais se não está carregando e tem mais páginas
    if (!loadingMore && !loading && data && data.currentPage < data.totalPages - 1) {
      console.log('MediaInfinity - Calling onLoadMore');
      onLoadMore();
    }
  };

  // Renderiza footer com skeleton ou indicador de fim
  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View className="py-4">
          <View className="flex-row justify-center items-center">
            <View className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-3" />
            <Text className="text-gray-400 text-sm">Carregando mais...</Text>
          </View>
        </View>
      );
    }
    
    // Se chegou ao final
    if (data && data.currentPage >= data.totalPages - 1 && allItems.length > 0) {
      return (
        <View className="py-8 items-center">
          <Icon name="done-all" size={32} color="#4B5563" />
          <Text className="text-gray-400 text-sm mt-2">
            Todos os resultados foram carregados
          </Text>
          <Text className="text-gray-600 text-xs mt-1">
            {allItems.length} itens no total
          </Text>
        </View>
      );
    }
    
    return null;
  };

  // Combina items reais com skeleton de loading
  const getFlatListData = () => {
    const data = [...allItems];
    
    // Adiciona skeleton items se está carregando mais
    if (loadingMore) {
      const skeletonCount = 6;
      for (let i = 0; i < skeletonCount; i++) {
        data.push({
          id: `skeleton-${i}`,
          titulo: 'Loading...',
          title: 'Loading...',
          posterURL1: '',
          posterURL2: '',
          avaliacao: 0,
          totalLikes: 0,
          isLoadingSkeleton: true
        } as any);
      }
    }
    
    return data;
  };

  const renderFlatListItem = ({ item, index }: { item: any, index: number }) => {
    return (
      <View 
        className="mb-3" 
        style={{ 
          width: gridConfig.itemWidth,
          marginLeft: index % gridConfig.numColumns === 0 ? 0 : 4,
          marginRight: index % gridConfig.numColumns === gridConfig.numColumns - 1 ? 0 : 4,
        }}
      >
        <MovieCard
          media={item}
          isLarge={gridConfig.cardSize === 'G'}
          size={gridConfig.cardSize}
          onPress={() => item.isLoadingSkeleton ? {} : onMediaInfo(item)}
          loading={item.isLoadingSkeleton || false}
        />
      </View>
    );
  };

  // Log do estado atual
  console.log('MediaInfinity - Current state:', {
    loading,
    loadingMore,
    hasData: !!data,
    allItemsCount: allItems.length,
    currentPage: data?.currentPage,
    totalPages: data?.totalPages,
    hasMorePages: data ? data.currentPage < data.totalPages - 1 : false
  });

  return (
    <View className="flex-1">
      {/* Loading inicial - mostra 20 skeleton cards */}
      {loading && allItems.length === 0 ? (
        <>
          {console.log('MediaInfinity - Showing initial loading skeleton (20 items)')}
          {renderLoadingSkeleton()}
        </>
      ) : (
        <>
          {console.log('MediaInfinity - Rendering infinite scroll with', allItems.length, 'items')}
          <FlatList
            data={getFlatListData()}
            numColumns={gridConfig.numColumns}
            renderItem={renderFlatListItem}
            keyExtractor={(item, index) => 
              item.isLoadingSkeleton ? `skeleton-${index}` : item.id.toString()
            }
            contentContainerStyle={{ 
              paddingHorizontal: 8,
              paddingTop: 8,
              paddingBottom: 20
            }}
            showsVerticalScrollIndicator={false}
            // Configurações para scroll infinito
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.1} // Carrega quando está a 10% do final
            ListFooterComponent={renderFooter}
            key={gridConfig.numColumns}
            // Performance otimizations
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={10}
          />
        </>
      )}
      
      {/* Fallback para quando não há dados */}
      {!loading && allItems.length === 0 && (
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