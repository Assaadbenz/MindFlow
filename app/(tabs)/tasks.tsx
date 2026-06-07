import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { getTasks, deleteTask, toggleTaskStatus, Task } from '@/utils/database';
import { showAlert, showConfirm } from '@/utils/alerts';

/**
 * ÉCRAN DE LA COLLECTION DE TÂCHES OPTIMISÉ (UI PREMIUM - DESIGN EXTRÊME)
 * 
 * Améliorations esthétiques appliquées aux cartes :
 * - Indicateur vertical à gauche : Une fine barre de couleur (Violet = Normal, Rouge = Urgent, Gris = Terminé) 
 *   indique immédiatement le statut au premier coup d'œil.
 * - Hiérarchie typographique : Contraste de taille et de nuances (titre foncé et gras, description ardoise plus douce).
 * - Checkbox subtile : Bordure grise discrète pour les tâches actives, devenant violet vif avec coche blanche au clic.
 * - Badge urgent : Design minimaliste avec dégradé doux rouge-rose.
 */

// COMPOSANT ENFANT (TaskItem) - Mémoïsé avec React.memo
// React.memo : Évite de re-dessiner chaque carte de tâche inutilement si son contenu n'a pas changé.
// Cela économise les ressources (processeur et batterie) du téléphone.
const TaskItem = React.memo(({
  item,
  onToggleStatus,
  onDelete,
}: {
  item: Task;
  onToggleStatus: (task: Task) => void;
  onDelete: (id: number) => void;
}) => {
  const isCompleted = item.status === 1; // 1 = pensée terminée, 0 = active
  const isUrgent = item.is_urgent === 1; // 1 = urgente, 0 = normale

  // cardStyle : Choisit dynamiquement le bon arrière-plan selon le statut/l'urgence
  const cardStyle = [
    styles.taskCard,
    isCompleted 
      ? styles.completedCard 
      : isUrgent 
      ? styles.urgentCard 
      : styles.normalCard
  ];

  return (
    <View style={cardStyle}>
      
      {/* INDICATEUR : Barre de statut flottante (violette, rouge ou grise) */}
      <View
        style={[
          styles.statusIndicator,
          isCompleted
            ? styles.completedIndicator
            : isUrgent
            ? styles.urgentIndicator
            : styles.normalIndicator,
        ]}
      />

      {/* TEXTES DE LA TÂCHE : Titre et Description */}
      <View style={styles.taskDetails}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.taskTitle,
              isCompleted && styles.completedText, // Barre le texte si terminé
            ]}
            numberOfLines={1} // Tronque si le texte dépasse une ligne
          >
            {item.title}
          </Text>
          {isUrgent && !isCompleted && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentBadgeText}>🔥 Urgent</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.taskDescription,
            isCompleted && styles.completedText,
          ]}
          numberOfLines={2} // Tronque si le texte dépasse deux lignes
        >
          {item.description}
        </Text>
      </View>

      {/* BOUTONS D'ACTION : Terminer et Supprimer */}
      <View style={styles.actionsContainer}>
        {/* Bouton "Déjà fait" (coche) */}
        <TouchableOpacity
          style={[
            styles.actionCircleButton,
            isCompleted ? styles.doneCircleActive : styles.doneCircleInactive
          ]}
          onPress={() => onToggleStatus(item)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.actionCircleText,
            isCompleted ? styles.doneTextActive : styles.doneTextInactive
          ]}>
            ✓
          </Text>
        </TouchableOpacity>

        {/* Bouton "Supprimer" (croix) */}
        <TouchableOpacity
          style={[styles.actionCircleButton, styles.deleteCircleButton]}
          onPress={() => onDelete(item.id)}
          activeOpacity={0.6}
        >
          <Text style={styles.deleteCircleButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ÉCRAN DE LA COLLECTION - app/(tabs)/tasks.tsx
export default function CollectionScreen() {
  const [tasks, setTasks] = useState<Task[]>([]); // Stocke le tableau de nos pensées locales
  const [loading, setLoading] = useState(true); // Gère l'indicateur de chargement au démarrage

  // CHARGEMENT : Récupère la liste des tâches stockées
  const loadTasks = useCallback(async () => {
    try {
      const fetchedTasks = await getTasks(); // Appelle notre base SQLite
      setTasks(fetchedTasks); // Met à jour le State pour afficher les cartes
    } catch (error) {
      console.error('Erreur de chargement des tâches :', error);
      showAlert('Erreur', 'Impossible de charger les tâches.');
    } finally {
      setLoading(false);
    }
  }, []);

  // FOCUS EFFECT : Se déclenche automatiquement à chaque fois que cet onglet s'affiche à l'écran.
  // Cela permet de recharger la liste instantanément après l'ajout d'une nouvelle tâche dans l'autre onglet.
  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  // CHANGEMENT STATUT : Active ou désactive la tâche
  const handleToggleStatus = useCallback(async (task: Task) => {
    try {
      await toggleTaskStatus(task.id, task.status); // Modifie en base de données
      loadTasks(); // Recharge la liste
    } catch (error) {
      console.error('Erreur lors du changement de statut :', error);
      showAlert('Erreur', 'Impossible de modifier le statut.');
    }
  }, [loadTasks]);

  // SUPPRESSION : Supprime définitivement la tâche après confirmation
  const handleDelete = useCallback((id: number) => {
    showConfirm(
      'Supprimer la tâche',
      'Voulez-vous vraiment supprimer cette tâche ?',
      async () => {
        try {
          await deleteTask(id); // Supprime en base de données
          loadTasks(); // Recharge la liste
        } catch (error) {
          console.error('Erreur lors de la suppression :', error);
          showAlert('Erreur', 'Impossible de supprimer la tâche.');
        }
      }
    );
  }, [loadTasks]);

  // STATISTIQUES (useMemo) : Calcule le nombre total, terminé, en cours et urgent.
  // useMemo permet d'éviter de refaire ce calcul si le tableau des tâches 'tasks' n'a pas bougé.
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 1).length;
    const pending = total - completed;
    const urgent = tasks.filter((t) => t.is_urgent === 1 && t.status === 0).length;
    return { total, completed, pending, urgent };
  }, [tasks]);

  // RENDER ITEM : Indique à la liste comment dessiner une ligne individuelle
  const renderTaskItem = useCallback(({ item }: { item: Task }) => (
    <TaskItem
      item={item}
      onToggleStatus={handleToggleStatus}
      onDelete={handleDelete}
    />
  ), [handleToggleStatus, handleDelete]);

  // HEADER DE LA LISTE : Affiche les cartes de statistiques en haut de la liste
  const renderHeader = () => (
    <View style={styles.dashboardContainer}>
      <Text style={styles.headerTitle}>Collection Tâches 📖</Text>
      <Text style={styles.headerSubtitle}>Gérez et suivez vos pensées enregistrées en local.</Text>

      {/* Cartes Statistiques */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#efeefd' }]}>
          <Text style={styles.statEmoji}>⚡</Text>
          <Text style={[styles.statNumber, { color: '#6200ee' }]}>{stats.pending}</Text>
          <Text style={[styles.statLabel, { color: '#5b5694' }]}>En cours</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#eefdf4' }]}>
          <Text style={styles.statEmoji}>✅</Text>
          <Text style={[styles.statNumber, { color: '#10b981' }]}>{stats.completed}</Text>
          <Text style={[styles.statLabel, { color: '#1e7557' }]}>Terminées</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fdf2f2' }]}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={[styles.statNumber, { color: '#ef4444' }]}>{stats.urgent}</Text>
          <Text style={[styles.statLabel, { color: '#993030' }]}>Urgentes</Text>
        </View>
      </View>

      <View style={styles.listHeaderRow}>
        <Text style={styles.sectionTitle}>Mes pensées actives</Text>
        <Text style={styles.tasksCountText}>{stats.total} au total</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* FlatList : Un composant haute performance qui n'affiche que les éléments visibles sur l'écran */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTaskItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🧘</Text>
              <Text style={styles.emptyTitle}>Votre collection est vide</Text>
              <Text style={styles.emptySubtitle}>
                Vous n'avez pas de tâches enregistrées. Utilisez l'onglet "+" pour en ajouter une.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF9F6', // Alignement sur le beige doux du design
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
  },
  dashboardContainer: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e1b4b',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#71717a',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 26,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e1b4b',
    marginBottom: 12,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  tasksCountText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  taskCard: {
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 20, // Plus compact car il n'y a plus la coche à gauche
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  normalCard: {
    backgroundColor: '#fbfaff', // Blanc teinté lavande très doux
    borderColor: '#ebe6ff',
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  urgentCard: {
    backgroundColor: '#fff8f8', // Blanc teinté pêche/rose très doux
    borderColor: '#ffe4e4',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  completedCard: {
    backgroundColor: '#f8fafc', // Gris ardoise très clair
    borderColor: '#cbd5e1',
    opacity: 0.65,
  },
  statusIndicator: {
    position: 'absolute',
    left: 8,
    top: 14,
    bottom: 14,
    width: 4, // Épaisseur fine premium
    borderRadius: 2, // Bords arrondis pour un effet pilule flottante
  },
  normalIndicator: {
    backgroundColor: '#6200ee', // Violet
  },
  urgentIndicator: {
    backgroundColor: '#ef4444', // Rouge
  },
  completedIndicator: {
    backgroundColor: '#cbd5e1', // Gris
  },
  taskDetails: {
    flex: 1,
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e1b4b', // Indigo foncé premium
    flexShrink: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  urgentBadge: {
    backgroundColor: '#ffe4e6', // Fond rose pâle
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  urgentBadgeText: {
    color: '#e11d48',
    fontSize: 10,
    fontWeight: '800',
  },
  taskDescription: {
    fontSize: 13,
    color: '#475569', // Couleur slate-600 très lisible
    lineHeight: 18,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionCircleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginLeft: 6,
  },
  actionCircleText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: -1,
  },
  doneCircleInactive: {
    backgroundColor: '#e6fcf5', // vert d'eau très clair
    borderColor: '#c3fae8',
  },
  doneTextInactive: {
    color: '#0ca678', // vert d'eau foncé
  },
  doneCircleActive: {
    backgroundColor: '#0ca678', // vert d'eau plein
    borderColor: '#0ca678',
  },
  doneTextActive: {
    color: '#ffffff',
  },
  deleteCircleButton: {
    backgroundColor: '#fff5f5', // rouge très clair
    borderColor: '#ffe3e3',
  },
  deleteCircleButtonText: {
    color: '#ff6b6b', // rouge corail
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: -1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    marginTop: 10,
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.02,
    shadowRadius: 16,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});
