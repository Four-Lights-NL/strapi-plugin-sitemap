import { useStrapiApp } from '@strapi/admin/strapi-admin'

const InjectionZone = ({ area, ...compProps }) => {
  const getPlugin = useStrapiApp('InjectionZone', (state) => state.getPlugin);

  const [pluginName, page, position] = area.split('.');

  const plugin = getPlugin(pluginName);
  const components = plugin?.getInjectedComponents(page, position);

  if (!plugin || !components) {
    return null;
  }

  return components.map(({ name, Component }) => (
    <Component key={name} {...props} />
  ));
};

export default InjectionZone;
