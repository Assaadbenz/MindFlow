import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

/**
 * STRUCTURE DE NAVIGATION (TABS) - app/(tabs)/_layout.tsx
 * 
 * Ce fichier configure le menu de navigation à onglets en bas de l'écran (le footer).
 * Chaque "Tabs.Screen" représente un bouton d'onglet qui pointe vers un fichier de ce dossier.
 */

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        // COULEURS DU FOOTER :
        tabBarActiveTintColor: '#6200ee', // Couleur de l'onglet actif (violet premium)
        tabBarInactiveTintColor: '#8e8c84', // Couleur des onglets inactifs (gris doux)
        
        // AFFICHAGE EN-TÊTE : useClientOnlyValue(webValue, nativeValue)
        // Sur le Web (SSR), React s'exécute côté serveur d'abord où les hooks natifs ne sont pas disponibles.
        // - Premier argument (false) : valeur utilisée sur le Web -> on cache l'en-tête natif pour éviter les conflits.
        // - Deuxième argument (true) : valeur utilisée sur iOS/Android -> on affiche l'en-tête natif.
        headerShown: useClientOnlyValue(false, true),
        
        // STYLE VISUEL DU FOOTER :
        tabBarStyle: {
          backgroundColor: '#FAF9F6', // Arrière-plan beige doux harmonisé
          borderTopColor: '#eae8e2', // Petite ligne séparatrice supérieure très fine
          height: 60, // Hauteur optimale pour mobile
          paddingBottom: 8, // Marge basse pour aérer le texte
          paddingTop: 8, // Marge haute pour aérer l'icône
        },
        tabBarLabelStyle: {
          fontSize: 11, // Taille du texte sous l'icône
          fontWeight: '600', // Police légèrement grasse pour une meilleure lisibilité
        },
      }}>
      
      {/* Onglet 1 : Home (Accueil) -> pointe vers 'index.tsx' */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          // tabBarIcon : Affiche l'icône.
          // 'focused' est un booléen automatiquement fourni qui vaut true si l'onglet est sélectionné.
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              // Si actif, on affiche l'icône remplie ('home'). Si inactif, le contour ('home-outline').
              name={focused ? 'home' : 'home-outline'}
              color={color}
              size={20}
            />
          ),
        }}
      />
      
      {/* Onglet 2 : Add (Ajouter) -> pointe vers 'add.tsx' */}
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'add-circle' : 'add-circle-outline'}
              color={color}
              size={20}
            />
          ),
        }}
      />

      {/* Onglet 3 : Tasks (Collection) -> pointe vers 'tasks.tsx' */}
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              // Journal ouvert quand actif, fermé/contour quand inactif
              name={focused ? 'journal' : 'journal-outline'}
              color={color}
              size={20}
            />
          ),
        }}
      />
      
      {/* Onglet 4 : Inspire (Inspiration) -> pointe vers 'explore.tsx' */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Inspire',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'sparkles' : 'sparkles-outline'}
              color={color}
              size={20}
            />
          ),
        }}
      />
    </Tabs>
  );
}
