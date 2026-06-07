import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Switch,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { insertTask } from '@/utils/database';
import { showAlert } from '@/utils/alerts';

/**
 * ÉCRAN D'AJOUT - app/(tabs)/add.tsx
 * 
 * Cet écran permet à l'utilisateur de saisir une pensée via un formulaire
 * et de la sauvegarder dans la base de données locale (SQLite ou LocalStorage).
 */

export default function AddTaskScreen() {
  // VARIABLES D'ÉTAT (useState) : Stockent le texte tapé par l'utilisateur
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(false); // Faux par défaut
  
  // FOCUS : Stockent si l'utilisateur a cliqué dans un champ (pour éclairer la bordure en violet)
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isDescFocused, setIsDescFocused] = useState(false);

  // FEEDBACK : Permet d'afficher une bannière verte de succès ou rouge d'erreur sous le titre
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  // SAUVEGARDE : Fonction lancée lors du clic sur le bouton "Enregistrer"
  const handleSave = async () => {
    setFeedback({ type: null, message: '' }); // On réinitialise les messages d'erreur

    // Validation : On vérifie que les champs ne sont pas vides
    if (!title.trim() || !description.trim()) {
      const msg = 'Le titre et la description doivent être renseignés.';
      setFeedback({ type: 'error', message: msg });
      showAlert('Champs obligatoires', msg);
      return;
    }

    try {
      // Étape SQLite : On insère la nouvelle pensée dans la base de données
      await insertTask(title.trim(), description.trim(), isUrgent);
      
      // Feedback positif
      const msg = 'La tâche a été enregistrée avec succès.';
      setFeedback({ type: 'success', message: msg });
      showAlert('Succès', msg);
      
      // On vide le formulaire
      setTitle('');
      setDescription('');
      setIsUrgent(false);
      
      // Ferme le clavier virtuel sur mobile
      Keyboard.dismiss();

      // On fait disparaître le bandeau de succès après 4 secondes
      setTimeout(() => {
        setFeedback((prev) => (prev.type === 'success' ? { type: null, message: '' } : prev));
      }, 4000);
    } catch (error) {
      const msg = 'Une erreur est survenue lors de l\'enregistrement.';
      setFeedback({ type: 'error', message: msg });
      showAlert('Erreur', msg);
      console.error(error);
    }
  };

  // FORMULAIRE : Le squelette HTML/React Native de notre formulaire
  const formContent = (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nouvelle tâche 🎯</Text>
        <Text style={styles.cardSubtitle}>Planifiez vos idées pour libérer votre esprit.</Text>

        {/* BANNIÈRE DE FEEDBACK : S'affiche si feedback.type n'est pas nul */}
        {feedback.type && (
          <View
            style={[
              styles.feedbackBanner,
              feedback.type === 'success' ? styles.successBanner : styles.errorBanner,
            ]}
          >
            <Text
              style={feedback.type === 'success' ? styles.successBannerText : styles.errorBannerText}
            >
              {feedback.type === 'success' ? '✅ ' : '⚠️ '}
              {feedback.message}
            </Text>
          </View>
        )}

        {/* CHAMP TITRE */}
        <Text style={styles.label}>Titre de la tâche</Text>
        <TextInput
          style={[
            styles.input,
            isTitleFocused && styles.inputFocused, // Bordure violette si focus = true
          ]}
          placeholder="Ex: Séance de yoga"
          placeholderTextColor="#a0a0b0"
          value={title}
          onChangeText={setTitle} // Met à jour la variable 'title' à chaque lettre tapée
          onFocus={() => setIsTitleFocused(true)} // Devient actif
          onBlur={() => setIsTitleFocused(false)} // Perd le focus
        />

        {/* CHAMP DESCRIPTION */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            isDescFocused && styles.inputFocused,
          ]}
          placeholder="Détaillez votre pensée..."
          placeholderTextColor="#a0a0b0"
          multiline // Permet d'aller à la ligne
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          onFocus={() => setIsDescFocused(true)}
          onBlur={() => setIsDescFocused(false)}
        />

        {/* INTERRUPTEUR D'URGENCE (SWITCH) */}
        <View style={styles.switchContainer}>
          <View>
            <Text style={styles.switchLabel}>Priorité urgente 🔥</Text>
            <Text style={styles.switchSubLabel}>Cette tâche requiert votre attention immédiate</Text>
          </View>
          <Switch
            trackColor={{ false: '#e4e4e7', true: '#d1c4e9' }}
            thumbColor={isUrgent ? '#6200ee' : '#ffffff'}
            ios_backgroundColor="#e4e4e7"
            onValueChange={setIsUrgent} // Change l'urgence (true/false)
            value={isUrgent}
          />
        </View>

        {/* BOUTON D'ENREGISTREMENT */}
        <TouchableOpacity style={styles.button} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Enregistrer localement</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Sur le Web, on retourne directement le formulaire
  if (Platform.OS === 'web') {
    return formContent;
  }

  // Sur mobile, on enveloppe dans TouchableWithoutFeedback pour fermer le clavier au clic en dehors
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {formContent}
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6', // Alignement sur le beige doux
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24, // Coins plus ronds modernes
    padding: 28,
    // Ombre douce haut de gamme (premium)
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0ede6',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e1b4b',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
  },
  feedbackBanner: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  successBanner: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  successBannerText: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '600',
  },
  errorBannerText: {
    color: '#991b1b',
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#f0ede6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 20,
  },
  inputFocused: {
    borderColor: '#6200ee', // Bordure violette lumineuse
    backgroundColor: '#ffffff',
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  textArea: {
    height: 110,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#faf9f6',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f0ede6',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  switchSubLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    maxWidth: 200,
  },
  button: {
    backgroundColor: '#6200ee',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
