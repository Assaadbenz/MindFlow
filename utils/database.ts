import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

/**
 * GESTIONNAIRE DE BASE DE DONNÉES UNIFIÉ (SQLite + LocalStorage)
 * 
 * Comment fonctionne ce fichier ?
 * 1. Sur Mobile : On utilise SQLite via 'expo-sqlite'. C'est une vraie base de données SQL stockée en local.
 * 2. Sur le Web : SQLite nécessite WebAssembly (.wasm) qui est souvent bloqué par la sécurité des navigateurs. 
 *    Pour éviter cela, on simule la base de données dans le 'localStorage' du navigateur.
 * 
 * Note : SQLite ne gère pas les booléens directement.
 * - Le statut (status) est stocké en INTEGER : 0 = tâche non terminée, 1 = tâche terminée.
 * - L'urgence (is_urgent) est stockée en INTEGER : 0 = tâche normale, 1 = tâche urgente.
 */

const DATABASE_NAME = 'mindflow.db';
const LOCAL_STORAGE_KEY = 'mindflow_tasks';

// Interface définissant la structure d'une tâche pour TypeScript
export interface Task {
  id: number;
  title: string;
  description: string;
  status: number; // 0 ou 1
  is_urgent: number; // 0 ou 1
}

// On vérifie si l'application tourne dans un navigateur Web
const isWeb = Platform.OS === 'web';

// Variables globales pour stocker la session en mémoire
let dbInstance: SQLite.SQLiteDatabase | null = null; // Stocke la connexion SQLite unique (Singleton)
let webTasksInMemory: Task[] = []; // Mémoire de secours si le localStorage web est indisponible

/**
 * [MODE WEB] Récupère la liste des tâches stockée sous forme de chaîne de caractères JSON dans le navigateur
 */
const getWebTasks = (): Task[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    // Si des données existent, on les transforme de texte JSON en tableau d'objets, sinon on retourne []
    return data ? JSON.parse(data) : [];
  }
  return webTasksInMemory;
};

/**
 * [MODE WEB] Sauvegarde le tableau de tâches en le convertissant en texte JSON dans le navigateur
 */
const saveWebTasks = (tasks: Task[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  } else {
    webTasksInMemory = tasks;
  }
};

/**
 * [MODE MOBILE] Récupère la connexion SQLite ou la crée si c'est le premier appel.
 * Mettre la connexion en cache (Singleton) évite de ralentir l'application en ouvrant
 * la base de données à chaque requête.
 */
export const getDBConnection = async (): Promise<SQLite.SQLiteDatabase | null> => {
  if (isWeb) return null;
  if (dbInstance) return dbInstance; // Retourne la connexion existante

  // Ouvre le fichier de base de données local de manière asynchrone
  dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
  return dbInstance;
};

/**
 * Initialise le stockage local au démarrage de l'application.
 * Crée la table 'tasks' si elle n'existe pas encore.
 */
export const initDatabase = async (): Promise<void> => {
  if (isWeb) {
    console.log('Mode Web : Persistance par LocalStorage initialisée.');
    return;
  }

  try {
    const db = await getDBConnection();
    if (db) {
      // execAsync permet d'exécuter une instruction SQL brute de création de table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          status INTEGER DEFAULT 0,
          is_urgent INTEGER DEFAULT 0
        );
      `);
      console.log('Base de données SQLite initialisée et mise en cache.');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données :', error);
    throw error;
  }
};

/**
 * Insère une nouvelle tâche en base.
 * 
 * @param title Titre de la tâche
 * @param description Description
 * @param isUrgent Vrai si urgente, Faux sinon (booléen converti en 0 ou 1)
 * @returns L'identifiant unique de la tâche créée
 */
export const insertTask = async (
  title: string,
  description: string,
  isUrgent: boolean
): Promise<number> => {
  if (isWeb) {
    const tasks = getWebTasks();
    // Génère un nouvel ID unique (le plus grand ID actuel + 1)
    const newId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
    const newTask: Task = {
      id: newId,
      title,
      description,
      status: 0, // 0 = tâche en cours par défaut
      is_urgent: isUrgent ? 1 : 0, // Conversion booléen -> integer
    };
    saveWebTasks([newTask, ...tasks]); // Insère la tâche au début de la liste
    return newId;
  }

  try {
    const db = await getDBConnection();
    if (!db) throw new Error('Base de données non disponible.');
    const isUrgentVal = isUrgent ? 1 : 0;
    
    // runAsync est utilisé pour les requêtes d'écriture (INSERT, UPDATE, DELETE).
    // Les '?' évitent les injections SQL en injectant proprement les paramètres du tableau.
    const result = await db.runAsync(
      'INSERT INTO tasks (title, description, status, is_urgent) VALUES (?, ?, 0, ?);',
      [title, description, isUrgentVal]
    );
    return result.lastInsertRowId; // Retourne l'id auto-incrémenté généré par SQLite
  } catch (error) {
    console.error('Erreur lors de l\'insertion de la tâche :', error);
    throw error;
  }
};

/**
 * Récupère la liste complète des tâches enregistrées (triées par ID décroissant).
 */
export const getTasks = async (): Promise<Task[]> => {
  if (isWeb) {
    return getWebTasks();
  }

  try {
    const db = await getDBConnection();
    if (!db) return [];
    
    // getAllAsync permet de récupérer un tableau de lignes correspondant à un SELECT
    return await db.getAllAsync<Task>('SELECT * FROM tasks ORDER BY id DESC;');
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches :', error);
    throw error;
  }
};

/**
 * Supprime définitivement une tâche à partir de son ID.
 */
export const deleteTask = async (id: number): Promise<void> => {
  if (isWeb) {
    const tasks = getWebTasks();
    // On garde uniquement les tâches qui n'ont pas l'ID qu'on veut supprimer
    const filtered = tasks.filter((t) => t.id !== id);
    saveWebTasks(filtered);
    return;
  }

  try {
    const db = await getDBConnection();
    if (!db) throw new Error('Base de données non disponible.');
    await db.runAsync('DELETE FROM tasks WHERE id = ?;', [id]);
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche :', error);
    throw error;
  }
};

/**
 * Bascule (toggle) le statut d'une tâche. Si elle était en cours (0), elle devient terminée (1) et inversement.
 */
export const toggleTaskStatus = async (id: number, currentStatus: number): Promise<void> => {
  if (isWeb) {
    const tasks = getWebTasks();
    const updated = tasks.map((t) => {
      if (t.id === id) {
        // Inverse le statut 1 -> 0 ou 0 -> 1
        return { ...t, status: currentStatus === 1 ? 0 : 1 };
      }
      return t;
    });
    saveWebTasks(updated);
    return;
  }

  try {
    const db = await getDBConnection();
    if (!db) throw new Error('Base de données non disponible.');
    const newStatus = currentStatus === 1 ? 0 : 1;
    await db.runAsync('UPDATE tasks SET status = ? WHERE id = ?;', [newStatus, id]);
  } catch (error) {
    console.error('Erreur lors du basculement du statut de la tâche :', error);
    throw error;
  }
};
