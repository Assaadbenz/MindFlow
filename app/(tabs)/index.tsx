import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

/**
 * ÉCRAN D'ACCUEIL - app/(tabs)/index.tsx
 * 
 * C'est le tableau de bord d'accueil de l'application (le portail).
 * Il affiche le logo, le titre "MindFlow", et 3 raccourcis rapides cliquables.
 */

export default function HomeScreen() {
  return (
    // SafeAreaView : Empêche le contenu de se superposer sur la barre d'état (heure, batterie) ou l'encoche de l'appareil.
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* EN-TÊTE : Affiche l'icône de la vague, le titre principal et le sous-titre de description */}
        <View style={styles.brandHeader}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🌊</Text>
          </View>
          <Text style={styles.brandTitle}>MindFlow</Text>
          <Text style={styles.brandSubtitle}>
            A clean workspace to collect mindful ideas and daily thought inspiration.
          </Text>
        </View>

        {/* Ligne séparatrice fine décorative */}
        <View style={styles.divider} />

        {/* SECTION RACCOURCIS : Cartes interactives vers les autres onglets */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>

          {/* Raccourci 1 : Ajouter une tâche */}
          <TouchableOpacity
            style={styles.actionCard}
            // router.push : Redirige l'utilisateur vers la page d'ajout
            onPress={() => router.push('/add' as any)}
            activeOpacity={0.7} // Marge de transparence lors du clic (micro-interaction)
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#fdf2ec' }]}>
              <Text style={[styles.actionIconText, { color: '#e07a5f' }]}>＋</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Add New Task</Text>
              <Text style={styles.actionSubtitle}>Save a new mindful thought</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Raccourci 2 : Voir la collection */}
          <TouchableOpacity
            style={styles.actionCard}
            // router.push : Redirige vers la liste des tâches
            onPress={() => router.push('/tasks' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#edf7f2' }]}>
              <Text style={[styles.actionIconText, { color: '#3d405b' }]}>📖</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View Collection</Text>
              <Text style={styles.actionSubtitle}>Browse your saved tasks</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Raccourci 3 : Citation d'inspiration */}
          <TouchableOpacity
            style={styles.actionCard}
            // router.push : Redirige vers l'écran de citations
            onPress={() => router.push('/explore' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#fcf8ec' }]}>
              <Text style={[styles.actionIconText, { color: '#f2cc8f' }]}>✨</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Daily Quote</Text>
              <Text style={styles.actionSubtitle}>Get inspired to flow</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF9F6', // Couleur d'arrière-plan beige très douce
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
  },
  brandHeader: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#ebf4f6', // Fond bleu-gris très doux pour le logo de la vague
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  logoText: {
    fontSize: 36,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1e1b4b',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 15,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#eae8e2',
    width: '100%',
    marginVertical: 10,
  },
  actionsSection: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a19f99',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0ede6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  actionIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionIconText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e1b4b',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#8e8c84',
  },
  chevron: {
    fontSize: 22,
    color: '#c2c0b8',
    fontWeight: '300',
    paddingHorizontal: 4,
  },
});
