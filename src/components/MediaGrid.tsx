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

interface MediaGridProps {
  data: PaginatedResponseDTO<MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO> | null;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onMediaInfo: (media: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO) => void;
  gridSize?: 'small' | 'medium' | 'large';
}

const { width: screenWidth } = Dimensions.get('window');

export const MediaGrid: React.FC<MediaGridProps> = ({
  data,
  loading = false,
  onPageChange,
  onMediaInfo,
  gridSize = 'medium'
}) => {

  const getGridConfig = () => {
    const padding = 16; // Reduzido para ocupar mais largura
    const spacing = 8; // Reduzido o espaçamento entre itens
    
    switch (gridSize) {
      case 'small':
        return { 
          numColumns: 4, // Aumentado para 4 colunas
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

  const renderGridItem = ({ item, index }: { item: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO, index: number }) => (
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
      />
    </View>
  );

  const renderLoadingSkeleton = () => (
    <FlatList
      data={Array.from({ length: 12 })}
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
          <View 
            className="bg-gray-800 rounded-lg animate-pulse"
            style={{ 
              width: '100%',
              height: gridConfig.cardSize === 'G' ? 210 : gridConfig.cardSize === 'P' ? 150 : 180,
              aspectRatio: 2/3
            }}
          />
        </View>
      )}
      keyExtractor={(_, index) => `skeleton-${index}`}
      contentContainerStyle={{ paddingHorizontal: 8, paddingTop: 8 }}
      scrollEnabled={false}
    />
  );

  const renderPagination = () => {
    if (!data || data.totalPages <= 1) return null;

    const { currentPage, totalPages } = data;
    const pages = [];
    
    // Lógica de paginação inteligente
    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);
    
    // Ajustar para mostrar sempre 5 páginas quando possível
    if (endPage - startPage < 4) {
      if (startPage === 0) {
        endPage = Math.min(totalPages - 1, startPage + 4);
      } else if (endPage === totalPages - 1) {
        startPage = Math.max(0, endPage - 4);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <View className="items-center py-6 px-4">
        <View className="flex-row items-center justify-center flex-wrap">
          {/* Botão Primeira Página */}
          {currentPage > 0 && (
            <>
              <TouchableOpacity
                onPress={() => onPageChange(0)}
                className="bg-gray-800 px-3 py-2 rounded-lg mx-1 mb-2"
              >
                <Text className="text-white text-sm">1</Text>
              </TouchableOpacity>
              
              {startPage > 1 && (
                <Text className="text-gray-500 px-2 mb-2">...</Text>
              )}
            </>
          )}
          
          {/* Páginas ao redor da atual */}
          {pages.map(page => (
            <TouchableOpacity
              key={page}
              onPress={() => onPageChange(page)}
              className={`px-3 py-2 rounded-lg mx-1 mb-2 ${
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
          
          {/* Botão Última Página */}
          {currentPage < totalPages - 1 && endPage < totalPages - 1 && (
            <>
              {endPage < totalPages - 2 && (
                <Text className="text-gray-500 px-2 mb-2">...</Text>
              )}
              
              <TouchableOpacity
                onPress={() => onPageChange(totalPages - 1)}
                className="bg-gray-800 px-3 py-2 rounded-lg mx-1 mb-2"
              >
                <Text className="text-white text-sm">{totalPages}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        
        {/* Botões de Navegação */}
        <View className="flex-row justify-center mt-4 space-x-4">
          <TouchableOpacity
            onPress={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className={`flex-row items-center px-4 py-2 rounded-lg ${
              currentPage === 0 ? 'bg-gray-800 opacity-50' : 'bg-gray-700'
            }`}
          >
            <Icon name="chevron-left" size={20} color="white" />
            <Text className="text-white ml-1">Anterior</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className={`flex-row items-center px-4 py-2 rounded-lg ${
              currentPage === totalPages - 1 ? 'bg-gray-800 opacity-50' : 'bg-gray-700'
            }`}
          >
            <Text className="text-white mr-1">Próximo</Text>
            <Icon name="chevron-right" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1">
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
              paddingHorizontal: 8,
              paddingTop: 8,
              paddingBottom: 20
            }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={renderPagination}
            key={gridConfig.numColumns} // Força re-render quando numColumns muda
          />
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