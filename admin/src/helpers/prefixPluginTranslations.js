/**
 * @typedef {Object.<string, string>} TradOptions
 */

/**
 * Prefixes all translation keys with the plugin ID
 * @param {TradOptions} trad - Object containing translations
 * @param {string} pluginId - Plugin identifier to prefix translations with
 * @returns {TradOptions} New object with prefixed translation keys
 * @throws {TypeError} If pluginId is empty
 */
const prefixPluginTranslations = (trad, pluginId) => {
  if (!pluginId) {
    throw new TypeError("pluginId can't be empty");
  }
  return Object.keys(trad).reduce((acc, current) => {
    acc[`${pluginId}.${current}`] = trad[current];
    return acc;
  }, {});
};

export default prefixPluginTranslations;
