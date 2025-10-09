const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = [
  // hanya folder yang perlu
    __dirname,
];

config.resolver.blacklistRE = /blockchain\/node_modules\/.*/;

module.exports = config;
