-- Initialisation de la base de données SpeakFree

-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS speakfree CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données
USE speakfree;

-- Afficher un message de confirmation
SELECT 'Database speakfree initialized successfully' AS message;
