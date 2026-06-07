import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { initDatabase } from '@/utils/database';

// ERREURS : Permet à Expo de capturer et d'afficher les erreurs s'il y a un bug dans l'arborescence.
export {
  ErrorBoundary,
} from 'expo-router';

// PARAMÈTRES EXPO : Définit l'onglet principal "(tabs)" comme point d'entrée par défaut de l'application.
export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// SPLASH SCREEN : Bloque l'écran de chargement blanc de l'application au démarrage.
// On attend que notre base de données soit prête avant d'afficher l'interface.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // dbReady : Indique si la base de données est initialisée et prête à être lue.
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function initializeApp() {
      try {
        // ÉTAPE OPTIMISÉE : On initialise la base SQLite (mobile) ou LocalStorage (web)
        // UNE SEULE FOIS au lancement global de l'application.
        await initDatabase();
        setDbReady(true);
      } catch (err) {
        console.error('Erreur lors de l\'initialisation de la base de données :', err);
        // Si erreur, on débloque quand même pour éviter d'afficher un écran figé à vie.
        setDbReady(true);
      } finally {
        // Une fois la base de données initialisée, on cache l'écran de chargement (Splash Screen).
        await SplashScreen.hideAsync();
      }
    }
    initializeApp();
  }, []);

  // Si la base de données n'est pas encore prête, on n'affiche rien (null).
  if (!dbReady) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    // THEME PROVIDER : Applique le thème de navigation par défaut (clair ou sombre)
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* On masque l'en-tête natif de Stack car les écrans de nos onglets gèrent déjà leur propre en-tête */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
