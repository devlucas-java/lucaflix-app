import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SearchService } from '../service/searchService';
import { movieService } from '../service/movieService';
import { serieService } from '../service/seriesService';
import type {
  PaginatedResponseDTO,
  MovieCompleteDTO,
  SerieCompleteDTO,
  MovieSimpleDTO,
  SerieSimpleDTO,
  AnimeSimpleDTO,
  SearchFilters
} from '../types/mediaTypes';
import { Type, Categoria, CATEGORIA_LABELS, TIPO_LABELS } from '../types/mediaTypes';

const { width } = Dimensions.get('window');

interface SearchScreenProps {
  navigation: any;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  // Estados principais
  const [searchResults, setSearchResults] = useState<PaginatedResponseDTO<MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Estados dos filtros
  const [filters, setFilters] = useState<SearchFilters>({
    texto: "",
    categoria: "",
    tipo: "all",
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Instância do serviço
  const searchService = new SearchService();

  // Função para buscar
  const performSearch = useCallback(
    async (searchFilters: SearchFilters, page: number = 0, append: boolean = false) => {
      if (page === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        const response = await searchService.searchMedia({
          texto: searchFilters.texto || undefined,
          categoria: searchFilters.categoria || undefined,
          tipo: searchFilters.tipo,
          page,
          size: 20,
        });

        if (append && searchResults) {
          setSearchResults({
            ...response,
            content: [...searchResults.content, ...response.content],
          });
        } else {
          setSearchResults(response);
        }

        if (response.totalElements === 0 && (searchFilters.texto || searchFilters.categoria || searchFilters.tipo !== "all")) {
          setError("Nenhum resultado encontrado para os critérios de busca.");
        }
      } catch (err: any) {
        setError(err.message || "Erro ao realizar busca. Tente novamente.");
        console.error("Search error:", err);
        if (!append) {
          setSearchResults(null);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchService, searchResults]
  );

  // Handlers para filtros
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0);

    if (key !== "texto") {
      setSearchResults(null);
      setError(null);
    }
  };

  const handleSearchSubmit = () => {
    setCurrentPage(0);
    if (filters.texto.trim() || filters.categoria || filters.tipo !== "all") {
      performSearch(filters, 0);
    } else {
      setSearchResults(null);
      setError(null);
    }
  };

  const handleClearFilters = () => {
    const clearedFilters: SearchFilters = {
      texto: "",
      categoria: "",
      tipo: "all",
    };
    setFilters(clearedFilters);
    setCurrentPage(0);
    setSearchResults(null);
    setError(null);
  };

  // Carregar mais resultados
  const loadMoreResults = () => {
    if (searchResults && !searchResults.last && !loadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      performSearch(filters, nextPage, true);
    }
  };

  // Função para abrir detalhes da mídia
  const handleMediaPress = async (media: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO) => {
    try {
      const isMovie = media.type === Type.MOVIE || ("duracaoMinutos" in media && !("totalTemporadas" in media));
      
      let completeMedia: MovieCompleteDTO | SerieCompleteDTO;
      
      if (isMovie) {
        completeMedia = await movieService.getMovieById(media.id);
      } else {
        completeMedia = await serieService.getSerieById(media.id);
      }

      navigation.navigate('MediaDetail', { media: completeMedia });
    } catch (error) {
      console.error("Error loading media details:", error);
      Alert.alert("Erro", "Não foi possível carregar os detalhes da mídia.");
    }
  };

  // Renderizar item da lista
  const renderMediaItem = ({ item }: { item: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO }) => (
    <TouchableOpacity
      className="mb-4 bg-gray-800 rounded-lg overflow-hidden"
      style={{ width: (width - 48) / 2 }}
      onPress={() => handleMediaPress(item)}
    >
      <Image
        source={{ uri: item.posterURL1 }}
        className="w-full h-64"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="text-white font-semibold text-sm" numberOfLines={2}>
          {item.title}
        </Text>
<View className="flex-row items-center mt-1">
  <Text className="text-gray-400 text-xs">
    {new Date(item.anoLancamento).getFullYear()}
  </Text>

  {Array.isArray(item.categoria) && item.categoria.length > 0 && (
    <View className="flex-row flex-wrap ml-2">
      {item.categoria.map((cat: string, index: number) => (
        <Text key={cat} className="text-gray-400 text-xs mr-1">
          {index > 0 && '• '} {CATEGORIA_LABELS[cat] ?? cat}
        </Text>
      ))}
    </View>
  )}
</View>

        <View className="flex-row items-center mt-1">
          <Icon 
            name={item.type === Type.MOVIE ? "movie" : "tv"} 
            size={12} 
            color="#EF4444" 
          />
          <Text className="text-red-500 text-xs ml-1">
            {item.type === Type.MOVIE ? "Filme" : item.type === Type.SERIE ? "Série" : "Anime"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Renderizar footer da lista
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View className="py-4 flex-row justify-center">
        <ActivityIndicator size="small" color="#EF4444" />
        <Text className="text-gray-400 ml-2">Carregando mais...</Text>
      </View>
    );
  };

  const hasActiveFilters = filters.texto.trim() || filters.categoria || filters.tipo !== "all";

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header com busca */}
      <View className="px-4 py-3 bg-black border-b border-gray-800">
        <View className="flex-row items-center space-x-3">
          <View className="flex-1 flex-row items-center bg-gray-900 rounded-lg px-3 py-2">
            <Icon name="search" size={20} color="#6B7280" />
            <TextInput
              className="flex-1 text-white ml-2 text-base"
              placeholder="Buscar filmes, séries e animes..."
              placeholderTextColor="#6B7280"
              value={filters.texto}
              onChangeText={(text) => handleFilterChange("texto", text)}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
          </View>
          
          <TouchableOpacity
            className={`p-2 rounded-lg ${showFilters ? 'bg-red-600' : 'bg-gray-800'}`}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Icon name="filter-list" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Filtros expansíveis */}
        {showFilters && (
          <View className="mt-4 bg-gray-900 rounded-lg p-4">
            {/* Filtro de categoria */}
            <View className="mb-4">
              <Text className="text-gray-300 text-sm font-medium mb-2">Categoria</Text>
              <View className="bg-gray-800 rounded-lg">
                <Picker
                  selectedValue={filters.categoria}
                  onValueChange={(value) => handleFilterChange("categoria", value)}
                  style={{ color: 'white' }}
                  dropdownIconColor="white"
                >
                  <Picker.Item label="Todas as categorias" value="" />
                  {Object.entries(CATEGORIA_LABELS).map(([key, label]) => (
                    <Picker.Item key={key} label={label} value={key} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Filtro de tipo */}
            <View className="mb-4">
              <Text className="text-gray-300 text-sm font-medium mb-2">Tipo</Text>
              <View className="bg-gray-800 rounded-lg">
                <Picker
                  selectedValue={filters.tipo}
                  onValueChange={(value) => handleFilterChange("tipo", value)}
                  style={{ color: 'white' }}
                  dropdownIconColor="white"
                >
                  {Object.entries(TIPO_LABELS).map(([key, label]) => (
                    <Picker.Item key={key} label={label} value={key} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Botões de ação */}
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-red-600 rounded-lg py-3"
                onPress={handleSearchSubmit}
              >
                <Text className="text-white text-center font-semibold">Buscar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`flex-1 rounded-lg py-3 ${hasActiveFilters ? 'bg-gray-700' : 'bg-gray-800'}`}
                onPress={handleClearFilters}
                disabled={!hasActiveFilters}
              >
                <Text className={`text-center font-semibold ${hasActiveFilters ? 'text-white' : 'text-gray-500'}`}>
                  Limpar
                </Text>
              </TouchableOpacity>
            </View>

            {/* Indicadores de filtros ativos */}
            {hasActiveFilters && (
              <View className="flex-row flex-wrap mt-3">
                {filters.texto.trim() && (
                  <View className="bg-red-600 rounded-full px-3 py-1 mr-2 mb-2">
                    <Text className="text-white text-xs">
                      Texto: "{filters.texto}"
                    </Text>
                  </View>
                )}
                {filters.categoria && (
                  <View className="bg-red-600 rounded-full px-3 py-1 mr-2 mb-2">
                    <Text className="text-white text-xs">
                      {CATEGORIA_LABELS[filters.categoria]}
                    </Text>
                  </View>
                )}
                {filters.tipo !== "all" && (
                  <View className="bg-red-600 rounded-full px-3 py-1 mr-2 mb-2">
                    <Text className="text-white text-xs">
                      {TIPO_LABELS[filters.tipo]}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </View>

      {/* Conteúdo principal */}
      <View className="flex-1">
        {/* Loading inicial */}
        {loading && (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#EF4444" />
            <Text className="text-gray-400 mt-2">Buscando conteúdo...</Text>
          </View>
        )}

        {/* Erro */}
        {error && !loading && (
          <View className="mx-4 mt-4 bg-red-900/20 border border-red-500 rounded-lg p-4 flex-row items-center">
            <Icon name="error" size={20} color="#EF4444" />
            <Text className="text-red-400 ml-2 flex-1">{error}</Text>
          </View>
        )}

        {/* Informações da busca */}
        {searchResults && !loading && (
          <View className="px-4 py-3 border-b border-gray-800">
            <Text className="text-gray-400">
              {searchResults.totalElements > 0 ? (
                <>
                  Encontrados{" "}
                  <Text className="text-white font-semibold">
                    {searchResults.totalElements.toLocaleString()}
                  </Text>{" "}
                  {searchResults.totalElements === 1 ? "resultado" : "resultados"}
                  {filters.texto && ` para "${filters.texto}"`}
                </>
              ) : (
                "Nenhum resultado encontrado"
              )}
            </Text>
          </View>
        )}

        {/* Estado vazio */}
        {!loading && !searchResults && !hasActiveFilters && (
          <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
            <View className="flex-1 justify-center items-center px-4">
              <Icon name="search" size={64} color="#374151" />
              <Text className="text-xl font-medium text-white mt-4 mb-2 text-center">
                Encontre seu próximo filme, série ou anime
              </Text>
              <Text className="text-gray-400 text-center mb-6 max-w-xs">
                Use a busca acima ou navegue pelas categorias para descobrir conteúdo incrível
              </Text>
              
              {/* Sugestões de categorias */}
              <View className="flex-row flex-wrap justify-center">
                {[
                  { key: Categoria.ACAO, label: "Ação" },
                  { key: Categoria.COMEDIA, label: "Comédia" },
                  { key: Categoria.DRAMA, label: "Drama" },
                  { key: Categoria.TERROR, label: "Terror" },
                  { key: Categoria.ROMANCE, label: "Romance" },
                ].map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    className="bg-gray-800 rounded-lg px-4 py-2 m-1"
                    onPress={() => {
                      handleFilterChange("categoria", key);
                      setTimeout(() => performSearch({ ...filters, categoria: key }, 0), 100);
                    }}
                  >
                    <Text className="text-gray-300 text-sm">{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        )}

        {/* Resultados da busca */}
        {searchResults && searchResults.content.length > 0 && (
          <FlatList
            data={searchResults.content}
            renderItem={renderMediaItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
            onEndReached={loadMoreResults}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Sugestões quando não há resultados */}
        {searchResults && searchResults.totalElements === 0 && hasActiveFilters && (
          <View className="px-4 py-6">
            <View className="bg-gray-900 rounded-lg p-4">
              <Text className="text-white font-medium mb-2">Tente ajustar sua busca:</Text>
              <Text className="text-gray-400 text-sm mb-1">• Verifique a ortografia das palavras</Text>
              <Text className="text-gray-400 text-sm mb-1">• Use termos mais gerais</Text>
              <Text className="text-gray-400 text-sm mb-1">• Remova alguns filtros</Text>
              <Text className="text-gray-400 text-sm mb-3">• Tente categorias relacionadas</Text>
              <TouchableOpacity onPress={handleClearFilters}>
                <Text className="text-red-400 text-sm">Limpar todos os filtros →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;