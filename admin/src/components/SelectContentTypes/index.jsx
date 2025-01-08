import React from 'react';
import {
  SingleSelectOption,
  SingleSelect,
} from '@strapi/design-system'
import { useIntl } from 'react-intl';

const SelectContentTypes = (props) => {
  const { formatMessage } = useIntl();

  const {
    contentTypes,
    onChange,
    disabled,
    value,
  } = props;

  return (
    <SingleSelect
      name="select"
      label={formatMessage({ id: 'sitemap.Settings.Field.SelectContentType.Label', defaultMessage: 'Content Type' })}
      hint={formatMessage({ id: 'sitemap.Settings.Field.SelectContentType.Description', defaultMessage: 'Select a content type.' })}
      disabled={disabled}
      onChange={(newValue) => onChange(newValue)}
      value={value}
      required
    >
      {Object.entries(contentTypes).map(([uid, { displayName }]) => {
        return <SingleSelectOption value={uid} key={uid}>{displayName}</SingleSelectOption>;
      })}
    </SingleSelect>
  );
};

export default SelectContentTypes;
