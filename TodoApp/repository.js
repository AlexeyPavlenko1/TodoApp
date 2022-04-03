'use strict';

function todoRepository() {
  return {
    getTodos: function getLocalTodos() {
      var todosJson = localStorage.getItem('todos');
      return todosJson ? JSON.parse(localStorage.getItem('todos')) : [];
    },

    setTodos: function setLocalTodos(todos) {
      localStorage['todos'] = JSON.stringify(todos);
    },
  };
}
