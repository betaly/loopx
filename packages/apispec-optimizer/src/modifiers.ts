import {humanize, pluralize, singularize, titleize, underscore} from 'inflection';

export const CrudOperationModifiers: Record<string, (controller: string) => string> = {
  find: modifyCrudOperation(pluralize, 'find'),
  count: modifyCrudOperation(pluralize, 'count'),
  updateAll: modifyCrudOperation(pluralize, 'updateAll'),
  create: modifyCrudOperation(singularize, 'create'),
  delete: modifyCrudOperation(singularize, 'delete'),
  patch: modifyCrudOperation(singularize, 'patch'),
  findById: modifyCrudOperation(singularize, 'find', 'ById'),
  updateById: modifyCrudOperation(singularize, 'update', 'ById'),
  deleteById: modifyCrudOperation(singularize, 'delete', 'ById'),
  replaceById: modifyCrudOperation(singularize, 'replace', 'ById'),
};

function modifyCrudOperation(inflect: (name: string) => string, firstToken: string, lastToken = '') {
  return (controller: string) => {
    // const capitalized = capitalize(controller);
    const inflected = titleize(inflect(humanize(underscore(controller)))).replace(/ /g, '');
    return `${firstToken}${inflected}${lastToken}`;
  };
}
