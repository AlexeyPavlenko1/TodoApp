function getView() {
  return {
    todoInput: document.querySelector('#todo-input'),
    form: document.querySelector('.wrap div form'),
    todoList: document.querySelector('.todo-list'),
    counterElement: document.querySelector('#counter'),
    toggleAllBtn: document.getElementById('toggle-all'),
    sortsList: document.getElementById('sorting'),
    clearCompleted: document.getElementById('clear-completed'),
    todoContainer: document.querySelector('.todo-container'),
  };
}
