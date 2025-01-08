import React from 'react';
import { Tabs, Box } from '@strapi/design-system';
import { useIntl } from 'react-intl';

import CollectionURLs from '../../tabs/CollectionURLs';
import CustomURLs from '../../tabs/CustomURLs';
import Settings from '../../tabs/Settings';

const SitemapTabs = () => {
  const { formatMessage } = useIntl();

  return (
    <Box padding={8}>
      <Tabs.Root defaultValue="collectionURLs" id="tabs">
        <Tabs.List aria-label="Main tabs">
          <Tabs.Trigger value="collectionURLs">{formatMessage({ id: 'sitemap.Settings.CollectionTitle', defaultMessage: 'URL bundles' })}</Tabs.Trigger>
          <Tabs.Trigger value="customURLs">{formatMessage({ id: 'sitemap.Settings.CustomTitle', defaultMessage: 'Custom URLs' })}</Tabs.Trigger>
          <Tabs.Trigger value="settings">{formatMessage({ id: 'sitemap.Settings.SettingsTitle', defaultMessage: 'Settings' })}</Tabs.Trigger>
        </Tabs.List>
          <Tabs.Content value="collectionURLs">
            <CollectionURLs />
          </Tabs.Content>
          <Tabs.Content value="customURLs">
            <CustomURLs />
          </Tabs.Content>
          <Tabs.Content value="settings">
            <Box padding={6} background="neutral0" shadow="filterShadow">
              <Settings />
            </Box>
          </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};

export default SitemapTabs;
