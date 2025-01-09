/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../helpers/configureStore';

import pluginPermissions from '../../permissions';
import Main from '../Main';
import { Page } from "@strapi/strapi/admin";

const App = () => {
  return (
    (<Page.Protect permissions={pluginPermissions.settings}>
      <Provider store={store}>
        <Main />
      </Provider>
    </Page.Protect>)
  );
};

export default App;
