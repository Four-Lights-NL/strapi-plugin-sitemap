import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';

import { useFetchClient } from '@strapi/strapi/admin';

import { useSelector } from 'react-redux';

import {
  Modal,
  Button,
  Typography,
  Tabs,
  Box,
  Divider,
} from '@strapi/design-system';

import CustomForm from './Custom';
import CollectionForm from './Collection';
import pluginId from '../../helpers/pluginId';
import InjectionZone from '../InjectionZone'

const ModalForm = (props) => {
  const [uid, setUid] = useState('');
  const [langcode, setLangcode] = useState('und');
  const [patternInvalid, setPatternInvalid] = useState({ invalid: false });
  const { formatMessage } = useIntl();
  const { post } = useFetchClient();

  const hasPro = useSelector((state) => state.getIn(['sitemap', 'info', 'hasPro'], false));

  const {
    onSubmit,
    onCancel,
    isOpen,
    id,
    lang,
    type,
    modifiedState,
    contentTypes,
  } = props;

  useEffect(() => {
    setPatternInvalid({ invalid: false });

    if (id && !uid) {
      setUid(id);
    } else {
      setUid('');
    }
    if (lang && langcode === 'und') {
      setLangcode(lang);
    } else {
      setLangcode('und');
    }

  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const submitForm = async (e) => {
    if (type === 'collection') {
      const { data: response } = await post('/sitemap/pattern/validate-pattern', {
        pattern: modifiedState.getIn([uid, 'languages', langcode, 'pattern'], null),
        modelName: uid,
      });

      if (!response.valid === 200) {
        setPatternInvalid({ invalid: true, message: response.message });
      } else onSubmit(e);
    } else onSubmit(e);
  };

  const form = () => {
    switch (type) {
      case 'collection':
        return <CollectionForm uid={uid} setUid={setUid} langcode={langcode} setLangcode={setLangcode} setPatternInvalid={setPatternInvalid} patternInvalid={patternInvalid} {...props} />;
      case 'custom':
        return <CustomForm uid={uid} setUid={setUid} {...props} />;
      default:
        return null;
    }
  };

  return (
    <Modal.Content
      onClose={() => onCancel()}
      labelledBy="title"
    >
      <Modal.Header>
        <Typography textColor="neutral800" variant="omega" fontWeight="bold">
          {formatMessage({ id: 'sitemap.Modal.HeaderTitle', defaultMessage: 'Sitemap entries' })} - {type}
        </Typography>
      </Modal.Header>
      <Modal.Body>
        <Tabs.Root defaultValue="basic" id="tabs" variant="simple">
          { hasPro ?
            <>
              <Tabs.List aria-label="Settings">
                <Tabs.Trigger value="basic">{formatMessage({ id: 'sitemap.Modal.Tabs.Basic.Title', defaultMessage: 'Basic settings' })}</Tabs.Trigger>
                <Tabs.Trigger value="advanced">{formatMessage({ id: 'sitemap.Modal.Tabs.Advanced.Title', defaultMessage: 'Advanced settings' })}</Tabs.Trigger>
              </Tabs.List>
              <Divider />
            </>
          : null }
          <Tabs.Content value="basic">
            <Box marginTop={4}>
              {form()}
            </Box>
          </Tabs.Content>
          <Tabs.Content value="advanced">
            <Box marginTop={4}>
              <InjectionZone
                area={`${pluginId}.modal.advanced`}
              />
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Modal.Body>
      <Modal.Footer
        startActions={(
          <Button onClick={() => onCancel()} variant="tertiary">
            {formatMessage({ id: 'sitemap.Button.Cancel', defaultMessage: 'Cancel' })}
          </Button>
        )}
        endActions={(
          <Button
            onClick={submitForm}
            disabled={!uid || (contentTypes && contentTypes[uid].locales && !langcode)}
          >
            {formatMessage({ id: 'sitemap.Button.Save', defaultMessage: 'Save' })}
          </Button>
        )}
      />
    </Modal.Content>
  );
};

export default ModalForm;
