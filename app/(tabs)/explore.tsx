import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * ÉCRAN D'INSPIRATION (CITATIONS DE SAGESSE)
 * 
 * Cet écran récupère de manière asynchrone des citations célèbres inspirantes
 * depuis l'API publique stable 'dummyjson.com/quotes/random'.
 */

interface QuoteResponse {
  id: number;
  quote: string;
  author: string;
}

export default function ExploreScreen() {
  // VARIABLES D'ÉTAT : Pour stocker la citation, l'auteur, l'état de chargement et les erreurs
  const [quote, setQuote] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true); // Actif par défaut pendant qu'on télécharge
  const [error, setError] = useState<string | null>(null);

  // CHARGEMENT CITATION : Effectue un appel réseau (HTTP Fetch) pour obtenir une citation aléatoire
  const fetchQuote = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // fetch : Appelle l'API internet dummyjson qui renvoie une citation aléatoire au format JSON
      const response = await fetch('https://dummyjson.com/quotes/random');
      if (!response.ok) {
        throw new Error('Impossible de contacter le serveur d\'inspiration.');
      }
      const data: QuoteResponse = await response.json();
      
      // Si la réponse contient bien les données attendues, on met à jour nos states
      if (data && data.quote && data.author) {
        setQuote(data.quote);
        setAuthor(data.author);
      } else {
        throw new Error('Données corrompues reçues de l\'API.');
      }
    } catch (err: any) {
      console.error(err);
      setError(
        'Oups ! Impossible de charger l\'inspiration. Veuillez vérifier votre connexion Internet.'
      );
    } finally {
      setLoading(false); // Chargement terminé (succès ou échec)
    }
  }, []);

  // ÉTAPE INITIALE : Lance le premier chargement de la citation dès que l'écran apparaît
  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>Inspiration du jour 💡</Text>
          <Text style={styles.subtitle}>Une citation célèbre pour élargir votre perspective et libérer votre flux d'esprit.</Text>
        </View>

        {/* Zone centrale d'affichage */}
        <View style={styles.cardContainer}>
          {loading ? (
            // Affiche l'indicateur de chargement (le cercle qui tourne)
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6200ee" />
              <Text style={styles.loadingText}>Recherche d'inspiration...</Text>
            </View>
          ) : error ? (
            // Affiche le message d'erreur et un bouton de secours pour réessayer
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchQuote} activeOpacity={0.8}>
                <Text style={styles.retryButtonText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Affiche la citation reçue avec son auteur
            <View style={styles.adviceCard}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Sagesse ✨</Text>
              </View>
              
              <Text style={styles.quoteMark}>“</Text>
              <Text style={styles.adviceText}>{quote}</Text>
              <Text style={styles.quoteMarkEnd}>”</Text>
              
              <Text style={styles.authorText}>— {author}</Text>
              
              <View style={styles.divider} />
              <Text style={styles.footerText}>MindFlow Inspiration</Text>
            </View>
          )}
        </View>

        {/* Bouton pour charger une nouvelle citation */}
        {!loading && !error && (
          <TouchableOpacity style={styles.refreshButton} onPress={fetchQuote} activeOpacity={0.85}>
            <Text style={styles.refreshButtonText}>Nouvelle citation</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF9F6', // Alignement sur le beige doux
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e1b4b',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 15,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 20,
  },
  adviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 3,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#f0ede6', // Bordure beige douce cohérente
  },
  badge: {
    backgroundColor: '#efeefd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6200ee',
  },
  quoteMark: {
    fontSize: 70,
    fontWeight: '900',
    color: '#d1c4e9',
    height: 40,
    lineHeight: 70,
    marginTop: -10,
  },
  quoteMarkEnd: {
    fontSize: 70,
    fontWeight: '900',
    color: '#d1c4e9',
    height: 40,
    lineHeight: 70,
    alignSelf: 'flex-end',
    marginBottom: -10,
  },
  adviceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 28,
    fontStyle: 'italic',
    marginVertical: 14,
    paddingHorizontal: 8,
  },
  authorText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6200ee',
    marginTop: 10,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0ede6',
    width: '100%',
    marginVertical: 20,
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fecaca',
  },
  errorText: {
    fontSize: 14,
    color: '#b91c1c',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  refreshButton: {
    backgroundColor: '#6200ee',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 10,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
