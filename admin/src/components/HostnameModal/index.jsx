import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';

import {
  Modal,
  Typography,
  Button,
  TextInput,
  Grid,
} from '@strapi/design-system';

import { isEqual } from 'lodash/fp';

const ModalForm = (props) => {
  const { formatMessage } = useIntl();
  const {
    onCancel,
    isOpen,
    languages,
    onSave,
    hostnameOverrides,
  } = props;

  const [hostnames, setHostnames] = useState({});

  useEffect(() => {
    if (isOpen) {
      setHostnames({ ...hostnameOverrides });
    } else {
      setHostnames({});
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal.Content
      onClose={() => onCancel()}
      labelledBy="title"
    >
      <Modal.Header>
        <Typography textColor="neutral800" variant="omega" fontWeight="bold">
          {formatMessage({ id: 'sitemap.HostnameOverrides.Label', defaultMessage: 'Hostname overrides' })}
        </Typography>
      </Modal.Header>
      <Modal.Body>
        <Grid.Root gap={4}>
          {languages.map((language) => (
            <Grid.Item key={language.code} col={6} s={12}>
              <TextInput
                placeholder={`https://${language.code}.strapi.io`}
                label={`${language.name} hostname`}
                name="hostname"
                value={hostnames[language.code]}
                hint={formatMessage({ id: 'sitemap.HostnameOverrides.Description', defaultMessage: 'Specify hostname per language' }, { langcode: language.code })}
                onChange={(e) => {
                  if (!e.target.value) {
                    delete hostnames[language.code];
                  } else {
                    hostnames[language.code] = e.target.value;
                  }

                  setHostnames({ ...hostnames });
                }}
              />
            </Grid.Item>
          ))}
        </Grid.Root>
      </Modal.Body>
      <Modal.Footer
        startActions={(
          <Button onClick={() => onCancel()} variant="tertiary">
            {formatMessage({ id: 'sitemap.Button.Cancel', defaultMessage: 'Cancel' })}
          </Button>
        )}
        endActions={(
          <Button
            onClick={() => onSave(hostnames)}
            disabled={isEqual(hostnames, hostnameOverrides)}
          >
            {formatMessage({ id: 'sitemap.Button.Save', defaultMessage: 'Save' })}
          </Button>
        )}
      />
    </Modal.Content>
  );
};

export default ModalForm;
