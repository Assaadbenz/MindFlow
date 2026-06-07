import { Platform, Alert } from 'react-native';

/**
 * UTILSATEUR DE DIALOGUES CROSS-PLATFORM (MOBILE + WEB)
 * 
 * Pourquoi ce fichier existe ?
 * - Sur mobile (iOS/Android), on utilise 'Alert.alert' de React Native pour afficher de jolies boîtes de dialogue.
 * - Sur le Web, 'Alert.alert' n'affiche rien du tout ou lance des avertissements.
 * - Ce fichier regroupe et automatise le choix du bon outil selon la plateforme (Web ou Mobile).
 */

/**
 * Affiche une alerte d'information simple.
 * 
 * @param title Le titre de l'alerte
 * @param message Le message à afficher
 */
export const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    // Sur le Web, on utilise la boîte d'alerte native du navigateur
    alert(`${title} : ${message}`);
  } else {
    // Sur mobile, on utilise l'alerte stylisée de React Native
    Alert.alert(title, message);
  }
};

/**
 * Affiche une boîte de dialogue demandant une confirmation à l'utilisateur.
 * Exemple d'usage : Confirmer avant de supprimer définitivement une tâche.
 * 
 * @param title Titre de la boîte (pour mobile)
 * @param message Message de confirmation
 * @param onConfirm Fonction de callback à exécuter si l'utilisateur clique sur "Confirmer" ou "OK"
 */
export const showConfirm = (title: string, message: string, onConfirm: () => void) => {
  if (Platform.OS === 'web') {
    // Sur le Web, 'window.confirm' affiche un pop-up avec les boutons OK et Annuler
    const isConfirmed = window.confirm(message);
    if (isConfirmed) {
      onConfirm(); // Si l'utilisateur clique sur OK, on exécute l'action de suppression
    }
  } else {
    // Sur mobile, on utilise 'Alert.alert' configuré avec deux boutons interactifs
    Alert.alert(
      title,
      message,
      [
        { text: 'Annuler', style: 'cancel' }, // Bouton d'annulation (ne fait rien)
        {
          text: 'Confirmer',
          style: 'destructive', // Style rouge (indique une action irréversible sur iOS)
          onPress: onConfirm, // Exécute l'action de suppression
        },
      ]
    );
  }
};
