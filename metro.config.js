const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Permettre à Metro de résoudre les fichiers WebAssembly (.wasm) requis par expo-sqlite sur le Web
config.resolver.assetExts.push('wasm');

module.exports = config;
