/* eslint-disable camelcase */

'use strict';

const { get } = require('lodash');
const xml2js = require('xml2js');

const parser = new xml2js.Parser({ attrkey: 'ATTR' });

const { noLimit, getService, logMessage } = require('../utils');

/**
 * Query service.
 */

/**
 * Get an array of fields extracted from all the patterns across
 * the different languages.
 *
 * @param {obj} contentType - The content type
 * @param {bool} topLevel - Should include only top level fields
 * @param {bool} isLocalized - Should include the locale field
 * @param {string} relation - Specify a relation. If you do; the function will only return fields of that relation.
 *
 * @returns {array} The fields.
 */
const getFieldsFromConfig = (contentType, topLevel = false, isLocalized = false, relation = null) => {
  let fields = [];

  if (contentType) {
    Object.entries(contentType['languages']).map(([langcode, { pattern }]) => {
      fields.push(...getService('pattern').getFieldsFromPattern(pattern, topLevel, relation));
    });
  }

  if (topLevel) {
    if (isLocalized) {
      fields.push('locale');
    }

    fields.push('updatedAt');
  }

  // Remove duplicates
  fields = [...new Set(fields)];

  return fields;
};

/**
 * Get an object of relations extracted from all the patterns across
 * the different languages.
 *
 * @param {obj} contentType - The content type
 *
 * @returns {object} The relations.
 */
const getRelationsFromConfig = (contentType) => {
  const relationsObject = {};

  if (contentType) {
    Object.entries(contentType['languages']).map(([langcode, { pattern }]) => {
      const relations = getService('pattern').getRelationsFromPattern(pattern);
      relations.map((relation) => {
        relationsObject[relation] = {
          fields: getFieldsFromConfig(contentType, false, false, relation),
        };
      });
    });
  }

  return relationsObject;
};

/**
 * Query the nessecary pages from Strapi to build the sitemap with.
 *
 * @param {obj} config - The config object
 * @param {string} contentType - Query only entities of this type.
 * @param {array} documentIds - Query only these documentIds.
 *
 * @returns {object} The pages.
 */
const getPages = async (config, contentType, documentIds) => {
  const excludeDrafts = config.excludeDrafts && strapi.contentTypes[contentType].options.draftAndPublish;
  const isLocalized = strapi.contentTypes[contentType].pluginOptions?.i18n?.localized;

  const relations = getRelationsFromConfig(config.contentTypes[contentType]);
  const fields = getFieldsFromConfig(config.contentTypes[contentType], true, isLocalized);

  const pages = await noLimit(strapi, contentType, {
    filters: {
      $or: [
        {
          sitemap_exclude: {
            $null: true,
          },
        },
        {
          sitemap_exclude: {
            $eq: false,
          },
        },
      ],
      documentId: documentIds ? {
        $in: documentIds,
      } : {},
    },
    locale: 'all',
    fields,
    populate: {
      localizations: {
        fields,
        populate: relations,
      },
      ...relations,
    },
    orderBy: 'documentId',
    publicationState: excludeDrafts ? 'live' : 'preview',
  });

  return pages;
};

/**
 * Query the IDs of the corresponding localization entities.
 *
 * @param {obj} contentType - The content type
 * @param {array} documentIds - Page documentIds
 *
 * @returns {object} The pages.
 */
const getLocalizationIds = async (contentType, documentIds) => {
  const isLocalized = strapi.contentTypes[contentType].pluginOptions?.i18n?.localized;
  const localizationIds = [];

  if (isLocalized) {
    const response = await strapi.documents(contentType).findMany({
      filters: { localizations: documentIds },
      locale: 'all',
      fields: ['documentId'],
    });

    response.map((localization) => localizationIds.push(localization.documentId));
  }

  return localizationIds;
};

/**
 * Compose the object used to invalide a part of the cache.
 *
 * @param {obj} config - The config
 * @param {string} type - The content type
 * @param {object} queryFilters - The query filters
 * @param {object} documentIds - Skip the query, just pass the documentIds
 *
 * @returns {object} The invalidation object.
 */
const composeInvalidationObject = async (config, type, queryFilters, documentIds = []) => {
  const mainIds = [...documentIds];

  if (documentIds.length === 0) {
    const updatedIds = await strapi.documents(type).findMany({
      filters: queryFilters,
      fields: ['documentId'],
    });
    updatedIds.map((page) => mainIds.push(page.documentId));
  }

  const mainLocaleIds = await getLocalizationIds(type, mainIds);

  // Add the updated entity.
  const invalidationObject = {
    [type]: {
      documentIds: [
        ...mainLocaleIds,
        ...mainIds,
      ],
    },
  };

  // Add all pages that have a relation to the updated entity.
  await Promise.all(Object.keys(config.contentTypes).map(async (contentType) => {
    const relations = Object.keys(getRelationsFromConfig(config.contentTypes[contentType]));

    await Promise.all(relations.map(async (relation) => {
      if (strapi.contentTypes[contentType].attributes[relation].target === type) {

        const pagesToUpdate = await strapi.documents(contentType).findMany({
          filters: { [relation]: mainIds },
          fields: ['documentId'],
        });

        if (pagesToUpdate.length > 0 && !invalidationObject[contentType]) {
          invalidationObject[contentType] = {};
        }

        const relatedIds = [];
        pagesToUpdate.map((page) => relatedIds.push(page.documentId));
        const relatedLocaleIds = await getLocalizationIds(contentType, relatedIds);

        invalidationObject[contentType] = {
          documentIds: [
            ...relatedLocaleIds,
            ...relatedIds,
          ],
        };
      }
    }));
  }));

  return invalidationObject;
};

/**
 * Get a sitemap from the database
 *
 * @param {string} name - The name of the sitemap
 * @param {number} delta - The delta of the sitemap
 * @param {array} fields - The fields array
 *
 * @returns {void}
 */
const getSitemap = async (name, delta, fields = ['sitemap_string']) => {
  const sitemap = await strapi.documents('plugin::sitemap.sitemap').findMany({
    filters: {
      name,
      delta,
    },
    fields,
  });

  return sitemap[0];
};

/**
 * Delete a sitemap from the database
 *
 * @param {string} name - The name of the sitemap
 *
 * @returns {void}
 */
const deleteSitemap = async (name) => {
  const sitemaps = await strapi.documents('plugin::sitemap.sitemap').findMany({
    filters: {
      name,
    },
    fields: ['documentId'],
  });

  await Promise.all(sitemaps.map(async (sm) => {
    await strapi.documents('plugin::sitemap.sitemap').delete({
      documentId: "__TODO__"
    });
  }));
};

/**
 * Create a sitemap in the database
 *
 * @param {obj} data - The sitemap data
 *
 * @returns {void}
 */
const createSitemap = async (data) => {
  const {
    name,
    delta,
    type,
    sitemap_string,
  } = data;

  let linkCount = null;

  parser.parseString(sitemap_string, (error, result) => {
    if (error) {
      strapi.log.error(logMessage(`An error occurred while trying to parse the sitemap XML to json. ${error}`));
      throw new Error();
    } else if (type === 'index') {
      linkCount = get(result, 'sitemapindex.sitemap.length') || 0;
    } else {
      linkCount = get(result, 'urlset.url.length') || 0;
    }
  });

  const sitemap = await strapi.documents('plugin::sitemap.sitemap').create({
    data: {
      sitemap_string,
      name,
      delta,
      type,
      link_count: linkCount,
    },
  });

  return sitemap.documentId;
};

/**
 * Create a sitemap_cache in the database
 *
 * @param {string} sitemapJson - The sitemap JSON
 * @param {string} name - The name of the sitemap
 * @param {number} sitemapId - The documentId of the sitemap
 *
 * @returns {void}
 */
const createSitemapCache = async (sitemapJson, name, sitemapId) => {
  const sitemap = await strapi.documents('plugin::sitemap.sitemap-cache').findMany({
    filters: {
      name,
    },
    fields: ['documentId'],
  });

  if (sitemap[0]) {
    await strapi.documents('plugin::sitemap.sitemap-cache').delete({
      documentId: "__TODO__"
    });
  }

  await strapi.documents('plugin::sitemap.sitemap-cache').create({
    data: {
      sitemap_json: sitemapJson,
      sitemap_documentId: sitemapId,
      name,
    },
  });
};

/**
 * Update a sitemap_cache in the database
 *
 * @param {string} sitemapJson - The sitemap JSON
 * @param {string} name - The name of the sitemap
 * @param {number} sitemapId - The documentId of the sitemap
 *
 * @returns {void}
 */
const updateSitemapCache = async (sitemapJson, name, sitemapId) => {
  const sitemap = await strapi.documents('plugin::sitemap.sitemap-cache').findMany({
    filters: {
      name,
    },
    fields: ['documentId'],
  });

  if (sitemap[0]) {
    await strapi.documents('plugin::sitemap.sitemap-cache').update({
      documentId: "__TODO__",

      data: {
        sitemap_json: sitemapJson,
        sitemap_documentId: sitemapId,
        name,
      }
    });
  }
};

/**
 * Get a sitemap_cache from the database
 *
 * @param {string} name - The name of the sitemap
 *
 * @returns {void}
 */
const getSitemapCache = async (name) => {
  const sitemap = await strapi.documents('plugin::sitemap.sitemap-cache').findMany({
    filters: {
      name,
    },
  });

  return sitemap[0];
};

module.exports = () => ({
  getFieldsFromConfig,
  getRelationsFromConfig,
  getPages,
  getLocalizationIds,
  createSitemap,
  getSitemap,
  deleteSitemap,
  createSitemapCache,
  updateSitemapCache,
  getSitemapCache,
  composeInvalidationObject,
});
