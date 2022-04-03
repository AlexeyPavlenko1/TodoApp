'use strict';

function getModel() {
  var filters;
  (function (filters) {
    filters['all'] = 'all';
    filters['active'] = 'active';
    filters['completed'] = 'completed';
  })(filters || (filters = {}));

  var sorts;
  (function (sorts) {
    sorts['asc'] = 'Asc';
    sorts['desc'] = 'Desc';
  })(sorts || (sorts = {}));

  return {
    filters: filters,
    sorts: sorts,
  };
}
