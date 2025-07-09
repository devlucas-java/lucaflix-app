import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../../theme/theme';

interface CustomHeaderProps {
  navigation: any;
  title: string;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({ navigation, title }) => {
  return (
    <SafeAreaView style={styles.headerContainer}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={theme.colors.background} 
      />
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.openDrawer()}
          >
            <Icon name="menu" size={28} color={theme.colors.text.primary} />
          </TouchableOpacity>
          
          <Image 
            source={require('../../../assets/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.headerTitle}>{title}</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Icon name="search" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="notifications" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Icon name="account-circle" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

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
            <Image 
              source={require('../../../assets/icon.png')} 
              style={styles.mediaLogo}
              resizeMode="contain"
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Header Styles
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
  menuButton: {
    marginRight: 16,
    padding: 4,
  },
  logo: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    color: theme.colors.text.primary, // Fixed: specify which text color to use
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  headerButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  profileButton: {
    padding: 4,
    marginLeft: 8,
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  mediaHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  mediaHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaLogo: {
    width: 32,
    height: 32,
  },
});