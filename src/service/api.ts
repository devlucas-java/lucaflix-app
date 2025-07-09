import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import theme from "../theme/theme";

export const API_BASE_URL = "https://lucaflix-backend.fly.dev/api";
//export const API_BASE_URL = "http://localhost:8080/api";

// Configuração base da API
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  async (config) => {
    try {
      // Pegar o token do AsyncStorage
      const token = await AsyncStorage.getItem("authToken");
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      if (theme.development) {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          hasToken: !!token,
          headers: config.headers,
        });
      }
      
      return config;
    } catch (error) {
      console.error("Erro ao obter token:", error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com respostas de erro
api.interceptors.response.use(
  (response) => {
    if (theme.development) {
      console.log(`API Response: ${response.status} ${response.config.url}`, {
        data: response.data,
      });
    }
    return response;
  },
  async (error) => {
    if (theme.development) {
      console.error("API Error:", {
        status: error.response?.status,
        url: error.config?.url,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
      });
    }

    // Fazer logout automático para qualquer erro 401
    if (error.response?.status === 409) {
      try {
        if (theme.development) {
          console.log("Erro 401 detectado, fazendo logout...");
        }
        
        // Remover dados do AsyncStorage
        await AsyncStorage.multiRemove(["authToken", "authUser"]);
        
        // Navegar para tela de login
        // Você precisará importar e usar o navigation aqui
        // Exemplo com React Navigation:
        // import { NavigationContainer } from '@react-navigation/native';
        // import { CommonActions } from '@react-navigation/native';
        
        // Para usar navigation, você pode:
        // 1. Criar um NavigationService
        // 2. Ou usar um Context/Redux para gerenciar estado de autenticação
        // 3. Ou emitir um evento personalizado
        
        // Exemplo com evento personalizado:
        
      } catch (asyncError) {
        console.error("Erro ao fazer logout:", asyncError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;