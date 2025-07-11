import { colorScheme } from "nativewind";
import { ActivityIndicator, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export const Loading = () => {

    return(
      <SafeAreaView className="flex-1 bg-black">
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E50914" />
          <Text className="text-white text-lg mt-4">Carregando LucaFlix...</Text>
        </View>
      </SafeAreaView>
    )
}