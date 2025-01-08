'use strict';

import bootstrap from './bootstrap'
import register from './register'
import services from './services'
import routes from './routes'
import config from './config'
import controllers from './controllers'
import contentTypes from './content-types'

module.exports = () => {
  return {
    bootstrap,
    register,
    routes,
    config,
    controllers,
    services,
    contentTypes,
  };
};
