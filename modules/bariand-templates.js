/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  // Define template paths to load
  const templatePaths = [
    // Actor Sheet Partials
    "systems/bariand/templates/parts/attributes.html",
    "systems/bariand/templates/parts/abilities.html",
    "systems/bariand/templates/parts/talents.html",
    "systems/bariand/templates/parts/inventory.html",
  ];

  // Load the template parts
  return loadTemplates(templatePaths);
};
