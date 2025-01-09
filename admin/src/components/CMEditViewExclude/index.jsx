import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { Box, Divider, Typography, Flex, Checkbox } from '@strapi/design-system';
import { useFetchClient, unstable_useContentManagerContext as useContentManagerContext } from '@strapi/strapi/admin';

import getTrad from '../../helpers/getTrad';

const CMEditViewExclude = () => {
  const [sitemapSettings, setSitemapSettings] = useState({});
  const { formatMessage } = useIntl();
  const { slug, form } = useContentManagerContext;
  const { values: modifiedData, onChange } = form
  const { get } = useFetchClient();

  const getSitemapSettings = async () => {
    const settings = await get('/sitemap/settings/');
    setSitemapSettings(settings);
  };

  useEffect(() => {
    getSitemapSettings();
  }, []);

  if (!sitemapSettings.contentTypes) return null;
  if (!sitemapSettings.contentTypes[slug]) return null;

  return (
    <Box paddingTop={6}>
      <Typography textColor="neutral600" variant="sigma">
        {formatMessage({ id: getTrad('plugin.name'), defaultMessage: 'Sitemap' })}
      </Typography>
      <Box paddingTop={2} paddingBottom={6}>
        <Divider />
      </Box>
      <Flex direction="column" gap={2}>
        <Box>
          <Checkbox
            onValueChange={(value) => {
              onChange({ target: { name: 'sitemap_exclude', value } });
            }}
            value={modifiedData.sitemap_exclude}
            name="exclude-from-sitemap"
          >
            {formatMessage({ id: getTrad('EditView.ExcludeFromSitemap'), defaultMessage: 'Exclude from sitemap' })}
          </Checkbox>
        </Box>
      </Flex>
    </Box>
  );
};

export default CMEditViewExclude;
