import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SearchHeaderProps {
  navigation: any;
  onSearch?: (query: string) => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({ navigation, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onSearch && onSearch(text);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch && onSearch('');
  };

  return (
    <View className="absolute top-0 left-0 right-0 z-50 bg-black">
      <StatusBar 
        barStyle="light-content"
        backgroundColor="#000000"
        translucent
      />
      
      <SafeAreaView className="bg-black">
        <View className="flex-row items-center px-4 py-3 h-16 bg-black">
          <TouchableOpacity
            className="p-2 mr-2"
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View className="flex-1 flex-row items-center bg-gray-800 rounded-lg px-3 py-2 mx-2">
            <Icon name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-white text-base ml-2"
              placeholder="Buscar filmes, séries, animes..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Icon name="close" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity className="p-2">
            <Icon name="mic" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};