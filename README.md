# 🌊 MindFlow

> **A clean workspace to collect mindful ideas and daily thought inspiration.**

MindFlow est une application mobile de gestion de tâches et d'inspiration personnelle, construite avec **Expo** et **React Native**. Elle permet de capturer, organiser et visualiser ses pensées et tâches du quotidien, avec une interface premium et minimaliste.

---

## 📱 Aperçu des écrans

| Écran | Description |
|---|---|
| 🏠 **Home** | Dashboard d'accueil avec raccourcis rapides |
| ➕ **Add** | Formulaire pour ajouter une nouvelle tâche |
| 📖 **Tasks** | Liste complète avec statistiques et gestion |
| ✨ **Inspire** | Citation inspirante du jour via API |

---

## ✨ Fonctionnalités

- ✅ **Ajouter des tâches** avec titre, description et priorité urgente
- 📋 **Gérer la collection** : marquer comme terminée, supprimer
- 📊 **Tableau de bord** : stats en temps réel (en cours / terminées / urgentes)
- 💡 **Inspiration quotidienne** : citations célèbres chargées depuis une API publique
- 💾 **Persistance locale** : données sauvegardées sur l'appareil (SQLite sur mobile, localStorage sur web)
- 🌙 **Support multi-plateforme** : iOS, Android et Web

---

## 🏗️ Architecture du projet

```
MindFlow/
├── app/
│   ├── _layout.tsx          → Layout racine (initialisation DB + SplashScreen)
│   └── (tabs)/
│       ├── _layout.tsx      → Navigation par onglets (TabBar)
│       ├── index.tsx        → Écran d'accueil
│       ├── add.tsx          → Formulaire d'ajout de tâche
│       ├── tasks.tsx        → Liste des tâches + statistiques
│       └── explore.tsx      → Citations d'inspiration (API externe)
├── utils/
│   ├── database.ts          → Couche données unifiée (SQLite / LocalStorage)
│   └── alerts.ts            → Alertes cross-platform (mobile + web)
├── components/              → Hooks utilitaires React Native
├── constants/
│   └── Colors.ts            → Palette de couleurs de l'application
└── assets/                  → Images et ressources statiques
```

---

## 🗄️ Stockage des données

MindFlow utilise une **stratégie de persistance duale** selon la plateforme :

| Plateforme | Solution | Raison |
|---|---|---|
| 📱 iOS / Android | **SQLite** via `expo-sqlite` | Base de données locale performante et native |
| 🌐 Web | **localStorage** du navigateur | SQLite nécessite WebAssembly, souvent bloqué par les navigateurs |

La couche `database.ts` expose une **API unifiée** : le reste de l'application n'a pas à se soucier de la plateforme.

### Structure de la table `tasks`

```sql
CREATE TABLE tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  description TEXT,
  status      INTEGER DEFAULT 0,   -- 0 = en cours, 1 = terminée
  is_urgent   INTEGER DEFAULT 0    -- 0 = normale, 1 = urgente
);
```

---

## 🚀 Installation et lancement

### Prérequis

- [Node.js](https://nodejs.org/) v18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Un appareil mobile ou un émulateur (iOS/Android) **ou** un navigateur web

### Étapes

```bash
# 1. Cloner le repository
git clone https://github.com/Assaadbenz/MindFlow.git
cd MindFlow

# 2. Installer les dépendances
npm install

# 3. Lancer l'application
npm start          # Lance Expo (scanner le QR code avec l'app Expo Go)
npm run android    # Lance sur émulateur Android
npm run ios        # Lance sur simulateur iOS (macOS uniquement)
npm run web        # Lance dans le navigateur
```

---

## 🛠️ Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| [Expo](https://expo.dev/) | ~54.0 | Framework mobile cross-platform |
| [React Native](https://reactnative.dev/) | 0.81.5 | UI native mobile |
| [React](https://react.dev/) | 19.1 | Bibliothèque UI |
| [TypeScript](https://www.typescriptlang.org/) | ~6.0 | Typage statique |
| [expo-router](https://expo.github.io/router/) | ~6.0 | Routing basé sur les fichiers |
| [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) | ~16.0 | Base de données locale (mobile) |
| [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) | ~4.1 | Animations fluides |
| [@expo/vector-icons](https://icons.expo.fyi/) | ^15 | Icônes (Ionicons) |

---

## ⚡ Optimisations React

Le projet applique les bonnes pratiques de performance React Native :

- **`React.memo`** sur `TaskItem` : évite de re-rendre les cartes non modifiées
- **`useCallback`** sur les handlers : mémorise les fonctions pour ne pas les recréer inutilement
- **`useMemo`** sur les statistiques : recalcule uniquement quand la liste de tâches change
- **`useFocusEffect`** : recharge les tâches uniquement quand l'onglet devient actif
- **Pattern Singleton** sur la connexion SQLite : une seule connexion ouverte pour toute l'app

---

## 🎨 Design

L'interface suit un design **minimaliste premium** avec :

- Palette principale : beige doux `#FAF9F6` + violet `#6200ee`
- Indicateurs visuels colorés par statut (violet = normal, rouge = urgent, gris = terminé)
- Cartes avec ombres douces et coins arrondis
- Badges et micro-interactions au clic (`activeOpacity`)

---

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).
