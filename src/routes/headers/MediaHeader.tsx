import React from 'react';
import {
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface MediaHeaderProps {
  navigation: any;
  showCast?: boolean;
  showMore?: boolean;
}

export const MediaHeader: React.FC<MediaHeaderProps> = ({
  navigation,
  showCast = true,
  showMore = true
}) => {
  return (
    <View className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <StatusBar 
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      <SafeAreaView className="bg-transparent">
        <View className="flex-row items-center justify-between px-4 py-3 h-16 bg-transparent">
          <TouchableOpacity
            className="p-2 bg-black/50 rounded-full"
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View className="flex-row items-center">
            {showCast && (
              <TouchableOpacity className="p-2 bg-black/50 rounded-full mr-2">
                <Icon name="cast" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            
            {showMore && (
              <TouchableOpacity className="p-2 bg-black/50 rounded-full">
                <Icon name="more-vert" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};