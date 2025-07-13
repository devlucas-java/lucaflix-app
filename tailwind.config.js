module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Principais
        background: '#0f1117',           // Azul escuro quase preto
        backgroundLight: '#1b1e26',      // Azul petróleo escuro
        backgroundCard: '#252935',       // Cinza-azulado
        surface: '#0f1117',
        primary: '#e50914',
        primaryHover: '#f40612',
        secondary: '#B20710',
        accent: '#566177',               // Azul acinzentado moderno
        noUse: '#b3b3b3',

        // Texto
        text: {
          primary: '#ffffff',
          secondary: '#a3a9b7',          // Cinza claro azulado
          muted: '#7c869a',              // Azul acinzentado suave
          inverse: '#000000',
        },

        // Botões
        button: {
          primary: '#f40612',
          primaryText: '#ffffff',
          secondary: '#ffffff',
          secondaryText: '#000000',
          secondary: 'rgba(109, 118, 129, 0.7)', // Azul acinzentado translúcido
          secondaryText: '#ffffff',
          danger: '#e50914',
          dangerText: '#ffffff',
        },

        // Status
        error: '#F40612',
        success: '#46D369',
        warning: '#FFA500',
        info: '#17a2b8',

        // Overlay
        overlay: 'rgba(0, 0, 0, 0.9)',     // Overlay mais frio
        overlayLight: 'rgba(20, 25, 34, 0.5)',

        // Bordas
        border: '#2b3345',              // Azul acinzentado escuro
        borderLight: '#3b445a',         // Azul acinzentado médio
      },
    },
  },
  plugins: [],
};
