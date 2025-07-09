// components/headers/CustomHeader.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../../theme/theme';

interface CustomHeaderProps {
  navigation: any;
  title: string;
}

interface SearchHeaderProps {
  navigation: any;
}

interface HomeHeaderProps {
  navigation: any;
}

interface ProfileHeaderProps {
  navigation: any;
}

// Header para tela de pesquisa
export const SearchHeader: React.FC<SearchHeaderProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={styles.headerContainer}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={theme.colors.background} 
      />
      <View style={styles.searchHeaderContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={theme.colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar filmes, séries, animes..."
            placeholderTextColor={theme.colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.headerButton}>
          <Icon name="mic" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Header para tela inicial
export const HomeHeader: React.FC<HomeHeaderProps> = ({ navigation }) => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Filmes');

  const categories = [
    { id: 'movies', name: 'Filmes', icon: 'movie' },
    { id: 'series', name: 'Séries', icon: 'tv' },
    { id: 'animes', name: 'Animes', icon: 'animation' },
  ];

  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category.name);
    setShowCategoryModal(false);
    // Aqui você pode adicionar lógica para filtrar conteúdo
  };

  return (
    <SafeAreaView style={styles.headerContainer}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={theme.colors.background} 
      />
      <View style={styles.homeHeaderContent}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          
          <TouchableOpacity 
            style={styles.categoryButton}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={styles.categoryText}>{selectedCategory}</Text>
            <Icon name="keyboard-arrow-down" size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Icon name="search" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Image 
              source={require('../../../assets/icon.png')} 
              style={styles.profileImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de Categorias */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.categoryModal}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                onPress={() => handleCategorySelect(category)}
              >
                <Icon name={category.icon} size={24} color={theme.colors.text.primary} />
                <Text style={styles.categoryItemText}>{category.name}</Text>
                {selectedCategory === category.name && (
                  <Icon name="check" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

// Header para tela de perfil
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.headerContainer}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={theme.colors.background} 
      />
      <View style={styles.profileHeaderContent}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Icon name="search" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="settings" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Header padrão (MyList)
export const CustomHeader: React.FC<CustomHeaderProps> = ({ navigation, title }) => {
  return (
    <SafeAreaView style={styles.headerContainer}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={theme.colors.background} 
      />
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Icon name="search" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Image 
              source={require('../../../assets/icon.png')} 
              style={styles.profileImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Header para tela de media
interface MediaHeaderProps {
  navigation: any;
}

export const MediaHeader: React.FC<MediaHeaderProps> = ({ navigation }) => {
  return (
    <View style={styles.mediaHeaderContainer}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={styles.mediaHeaderSafeArea}>
        <View style={styles.mediaHeaderContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={28} color={theme.colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.mediaHeaderRight}>
            <TouchableOpacity style={styles.mediaHeaderButton}>
              <Icon name="cast" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.mediaHeaderButton}>
              <Icon name="more-vert" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Base Header Styles
  headerContainer: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.accent,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 80,
    height: 30,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  profileButton: {
    padding: 4,
    marginLeft: 8,
  },
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },

  // Search Header Styles
  searchHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text.primary,
    fontSize: 16,
    marginLeft: 8,
  },

  // Home Header Styles
  homeHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: theme.colors.surface,
  },
  categoryText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },

  // Category Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 120,
  },
  categoryModal: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    borderRadius: 8,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryItemText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },

  // Profile Header Styles
  profileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
  },

  // Media Header Styles
  mediaHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  mediaHeaderSafeArea: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  mediaHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
  },
  mediaHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaHeaderButton: {
    padding: 8,
    marginHorizontal: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
});