// App.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Router from './src/routes/Router';
import './global.css';

// Netflix-inspired color palette
const theme = {
  colors: {
    primary: '#E50914',
    secondary: '#B20710',
    background: '#000000',
    surface: '#141414',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    error: '#F40612',
    success: '#46D369',
    warning: '#FFA500',
    accent: '#564D4D',
  }
};

const App: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={theme.colors.background} />
      <Router />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default App;