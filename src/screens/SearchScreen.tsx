import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { SearchService } from '../service/searchService';
import { movieService } from '../service/movieService';
import { serieService } from '../service/seriesService';
import { animeService } from '../service/animeService';
import { MediaGrid } from '../components/MediaGrid';
import type {
  PaginatedResponseDTO,
  MovieSimpleDTO,
  SerieSimpleDTO,
  AnimeSimpleDTO,
  MediaComplete,
} from '../types/mediaTypes';
import { Type, Categoria, CATEGORIA_LABELS, TIPO_LABELS } from '../types/mediaTypes';

const SearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchResults, setSearchResults] = useState<PaginatedResponseDTO<MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO> | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const searchService = new SearchService();

  const performSearch = useCallback(
    async (page: number = 0) => {
      if (!searchText.trim() && !selectedCategory && selectedType === "all") return;
      
      setLoading(page === 0);
      
      try {
        const response = await searchService.searchMedia({
          texto: searchText.trim() || undefined,
          categoria: selectedCategory || undefined,
          tipo: selectedType,
          page,
          size: 20,
        });

        if (page === 0) {
          setSearchResults(response);
        } else {
          setSearchResults(prev => prev ? {
            ...response,
            content: [...prev.content, ...response.content]
          } : response);
        }
      } catch (error) {
        Alert.alert("Erro", "Erro ao realizar busca. Tente novamente.");
      } finally {
        setLoading(false);
      }
    },
    [searchText, selectedCategory, selectedType, searchService]
  );

  const handleSearch = () => {
    setCurrentPage(0);
    performSearch(0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    performSearch(page);
  };

  const handleMediaPress = async (media: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO) => {
    try {
      let completeMedia: MediaComplete;
      
      if (media.type === Type.MOVIE) {
        completeMedia = await movieService.getMovieById(media.id);
      } else if (media.type === Type.SERIE) {
        completeMedia = await serieService.getSerieById(media.id);
      } else {
        completeMedia = await animeService.getAnimeById(media.id);
      }

      navigation.navigate('MediaScreen', { media: completeMedia });
    } catch (error) {
      console.error("Error loading media details:", error);
      // Fallback: navegar com dados básicos
      navigation.navigate('MediaScreen', { media });
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedCategory("");
    setSelectedType("all");
    setSearchResults(null);
    setCurrentPage(0);
  };

  const hasActiveFilters = searchText.trim() || selectedCategory || selectedType !== "all";

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className='h-8'/>
      {/* Header com busca e filtros */}
      <View className="px-4 py-3 bg-black">
        {/* Barra de busca */}
        <View className="flex-row max-h-14 items-center space-x-2 mb-3">
          <View className="flex-1 flex-row items-center bg-gray-900 rounded-lg px-3 py-1">
            <Icon name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-white ml-2 text-base"
              placeholder="Buscar filmes, séries e animes..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          
          <TouchableOpacity
            className="bg-red-600 rounded-lg px-4 py-3"
            onPress={handleSearch}
          >
            <Text className="text-white font-semibold">Buscar</Text>
          </TouchableOpacity>
        </View>

        {/* Filtros Netflix Style */}
        <View className="flex-row items-center space-x-3">
          {/* Filtro Categorias */}
          <TouchableOpacity
            className="flex-row items-center bg-gray-900 rounded-lg px-3 py-2 border border-gray-700"
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <Text className="text-white text-sm mr-2">
              {selectedCategory ? CATEGORIA_LABELS[selectedCategory] : "Categorias"}
            </Text>
            <Icon 
              name={showCategoryPicker ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={18} 
              color="#9CA3AF" 
            />
          </TouchableOpacity>

          {/* Filtro Mídia */}
          <TouchableOpacity
            className="flex-row items-center bg-gray-900 rounded-lg px-3 py-2 border border-gray-700"
            onPress={() => setShowTypePicker(!showTypePicker)}
          >
            <Text className="text-white text-sm mr-2">
              {TIPO_LABELS[selectedType]}
            </Text>
            <Icon 
              name={showTypePicker ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={18} 
              color="#9CA3AF" 
            />
          </TouchableOpacity>

          {/* Limpar filtros */}
          {hasActiveFilters && (
            <TouchableOpacity
              className="bg-gray-800 rounded-lg px-3 py-2"
              onPress={clearFilters}
            >
              <Text className="text-red-400 text-sm">Limpar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Picker de Categorias */}
        {showCategoryPicker && (
          <View className="mt-3 bg-gray-900 rounded-lg border border-gray-700">
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                setShowCategoryPicker(false);
              }}
              style={{ color: 'white' }}
              dropdownIconColor="white"
            >
              <Picker.Item label="Todas as categorias" value="" />
              {Object.entries(CATEGORIA_LABELS).map(([key, label]) => (
                <Picker.Item key={key} label={label} value={key} />
              ))}
            </Picker>
          </View>
        )}

        {/* Picker de Tipos */}
        {showTypePicker && (
          <View className="mt-3 bg-gray-900 rounded-lg border border-gray-700">
            <Picker
              selectedValue={selectedType}
              onValueChange={(value) => {
                setSelectedType(value);
                setShowTypePicker(false);
              }}
              style={{ color: 'white' }}
              dropdownIconColor="white"
            >
              {Object.entries(TIPO_LABELS).map(([key, label]) => (
                <Picker.Item key={key} label={label} value={key} />
              ))}
            </Picker>
          </View>
        )}

        {/* Indicadores de filtros ativos */}
        {hasActiveFilters && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            <View className="flex-row space-x-2">
              {searchText.trim() && (
                <View className="bg-red-600 rounded-full px-3 py-1">
                  <Text className="text-white text-xs">
                    "{searchText.trim()}"
                  </Text>
                </View>
              )}
              {selectedCategory && (
                <View className="bg-red-600 rounded-full px-3 py-1">
                  <Text className="text-white text-xs">
                    {CATEGORIA_LABELS[selectedCategory]}
                  </Text>
                </View>
              )}
              {selectedType !== "all" && (
                <View className="bg-red-600 rounded-full px-3 py-1">
                  <Text className="text-white text-xs">
                    {TIPO_LABELS[selectedType]}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Conteúdo principal */}
      <View className="flex-1">
        {/* Loading */}
        {loading && !searchResults && (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#E50914" />
            <Text className="text-gray-400 mt-2">Buscando conteúdo...</Text>
          </View>
        )}

        {/* Estado vazio inicial */}
        {!loading && !searchResults && !hasActiveFilters && (
          <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
            <View className="flex-1 justify-center items-center px-6">
              <Icon name="search" size={80} color="#374151" />
              <Text className="text-2xl font-bold text-white mt-6 mb-3 text-center">
                O que você quer assistir?
              </Text>
              <Text className="text-gray-400 text-center mb-8 text-base leading-6">
                Encontre filmes, séries e animes incríveis usando nossa busca avançada
              </Text>
              
              {/* Categorias populares */}
              <Text className="text-white font-semibold mb-4">Categorias populares:</Text>
              <View className="flex-row flex-wrap justify-center">
                {[
                  { key: Categoria.ACAO, label: "Ação" },
                  { key: Categoria.COMEDIA, label: "Comédia" },
                  { key: Categoria.DRAMA, label: "Drama" },
                  { key: Categoria.TERROR, label: "Terror" },
                  { key: Categoria.ROMANCE, label: "Romance" },
                  { key: Categoria.FICCAO_CIENTIFICA, label: "Ficção Científica" },
                ].map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    className="bg-gray-800 rounded-lg px-4 py-2 m-1 border border-gray-700"
                    onPress={() => {
                      setSelectedCategory(key);
                      setTimeout(() => {
                        setCurrentPage(0);
                        performSearch(0);
                      }, 100);
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
        {searchResults && (
          <MediaGrid
            data={searchResults}
            loading={loading}
            onPageChange={handlePageChange}
            onMediaInfo={handleMediaPress}
            gridSize="medium"
          />
        )}

        {/* Nenhum resultado encontrado */}
        {searchResults && searchResults.totalElements === 0 && (
          <View className="flex-1 justify-center items-center px-6">
            <Icon name="search-off" size={64} color="#374151" />
            <Text className="text-xl font-semibold text-white mt-4 mb-2 text-center">
              Nenhum resultado encontrado
            </Text>
            <Text className="text-gray-400 text-center mb-6">
              Tente ajustar seus filtros ou usar termos diferentes
            </Text>
            
            <TouchableOpacity
              className="bg-red-600 rounded-lg px-6 py-3"
              onPress={clearFilters}
            >
              <Text className="text-white font-semibold">Limpar filtros</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View className='h-14'/>
    </SafeAreaView>
  );
};

export default SearchScreen;