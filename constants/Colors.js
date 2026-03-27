// Paleta de colores de la aplicación Credit Tracker
// Tema profesional azul/verde financiero

export const Colors = {
  // Colores primarios
  primary: '#1565C0',        // Azul oscuro principal
  primaryLight: '#1E88E5',   // Azul claro
  primaryDark: '#0D47A1',    // Azul muy oscuro

  // Colores secundarios (verde financiero)
  secondary: '#2E7D32',      // Verde oscuro
  secondaryLight: '#43A047', // Verde claro
  secondaryDark: '#1B5E20',  // Verde muy oscuro

  // Colores de acento
  accent: '#00ACC1',         // Cian/Turquesa

  // Colores de estado
  success: '#388E3C',        // Verde éxito
  warning: '#F57C00',        // Naranja advertencia
  error: '#C62828',          // Rojo error
  info: '#0277BD',           // Azul información

  // Neutros
  white: '#FFFFFF',
  black: '#000000',
  background: '#F5F7FA',     // Fondo gris muy claro
  surface: '#FFFFFF',        // Superficie de tarjetas
  border: '#E0E0E0',         // Bordes
  divider: '#EEEEEE',        // Divisores

  // Textos
  textPrimary: '#212121',    // Texto principal oscuro
  textSecondary: '#757575',  // Texto secundario gris
  textDisabled: '#BDBDBD',   // Texto deshabilitado
  textOnPrimary: '#FFFFFF',  // Texto sobre fondo primario

  // Tarjetas de crédito (gradientes simulados con colores)
  cardBlue: '#1565C0',
  cardGreen: '#2E7D32',
  cardPurple: '#6A1B9A',
  cardOrange: '#E65100',
  cardGold: '#F9A825',

  // Cuentas bancarias
  bankBlue: '#0277BD',
  bankGreen: '#00695C',
  bankGray: '#455A64',
};

// Tipografías
export const Typography = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  h4: { fontSize: 18, fontWeight: '600' },
  body1: { fontSize: 16 },
  body2: { fontSize: 14 },
  caption: { fontSize: 12 },
  small: { fontSize: 10 },
};

// Espaciados
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Bordes redondeados
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

export default Colors;
