'use strict';

var todoInput = document.querySelector('#todo-input');
var form = document.querySelector('.wrap div form');
var todoList = document.querySelector('.todo-list');
var counterElement = document.querySelector('#counter');
var filterOption = document.querySelector('.filter-todo');
var toggleAllBtn = document.getElementById('toggle-all');
var filters = Array.from(document.querySelectorAll('.filter'));
var sorts = Array.from(document.querySelectorAll('ul#sorting li'));
var clearCompleted = document.getElementById('clear-completed');

var currentFilter = filters[0];

//Event Listeners
document.addEventListener('DOMContentLoaded', function () {
  renderTodos(currentFilter);
});

form.addEventListener('submit', addTodo);

filters.forEach(filter => {
  filter.addEventListener('click', function () {
    renderTodos(filter);
  });
});

sorts.forEach(function (sort) {
  sort.addEventListener('click', function () {
    renderTodos(null, sort.innerText === 'Desc');
  });
});

toggleAllBtn.addEventListener('click', function (e) {
  e.preventDefault();
  toggleAll();
});

clearCompleted.addEventListener('click', function () {
  todoList.innerHTML = '';
  setLocalTodos(
    getLocalTodos().filter(function (todo) {
      return todo.status !== 'completed';
    })
  );
  renderTodos(currentFilter);
});

//Functions
function toggleAll() {
  var todos = getLocalTodos();
  var allComplete = todos.every(function (todo) {
    return todo.status === 'completed';
  });

  if (allComplete) {
    todos.forEach(function (todo) {
      return (todo.status = 'active');
    });
  } else {
    todos.forEach(function (todo) {
      todo.status = 'completed';
    });
  }
  setLocalTodos(todos);
  var renderedTodos = todoList.querySelectorAll('.todo');
  renderedTodos.forEach(function (element) {
    element.remove();
  });
  renderTodos();
}

function updateCounter(filteredTodosNumber) {
  var value = filteredTodosNumber;
  var filter = currentFilter.innerText.toLowerCase();
  counterElement.innerText = value + ' ' + (filter === 'all' ? 'total' : filter);
}

function sortTodos(todos, isDescSort) {
  todos.sort(function (first, second) {
    var descByText = second.text.toLowerCase().localeCompare(first.text.toLowerCase());
    var descByTime = second.createdAt - first.createdAt;
    return isDescSort ? (descByText ? descByText : descByTime) : -descByText ? -descByText : -descByTime;
  });
  return todos;
}

function addTodo(e) {
  e.preventDefault();
  var todoText = todoInput.value.trim();
  todoInput.value = '';
  if (validateTodoText(todoText)) {
    var createdAt = new Date().getTime();
    saveNewTodo(todoText, createdAt);
    renderTodos(currentFilter);
  }
}

function createNewTodoElement(todoText, todoDiv) {
  var newTodo = document.createElement('li');
  newTodo.classList.add('todo-item');
  newTodo.textContent = todoText;
  todoInput.value = '';
  todoDiv.appendChild(newTodo);
  return newTodo;
}

function saveNewTodo(todoText, createdAt) {
  var todos = getLocalTodos();
  var newTodo = { text: todoText, status: 'active', createdAt: createdAt };
  todos.push(newTodo);
  localStorage.setItem('todos', JSON.stringify(todos));
  updateCounter(todos.length);
}

function renderTodos(filter, isDescOrder) {
  //clear todo list
  todoList.querySelectorAll('.todo').forEach(function (childNode) {
    childNode.remove();
  });
  var todos = getLocalTodos();
  hideClearBtn(todos);
  todos = filter ? filterTodos(todos, filter) : filterTodos(todos, currentFilter);
  if (isDescOrder !== undefined) {
    sortTodos(todos, isDescOrder);
  }
  todos.forEach(function (todo) {
    var todoDiv = createTodoDiv(todo.createdAt);
    createCheckBox(todoDiv, todo.status);
    var newTodo = createNewTodoElement(todo.text, todoDiv);
    newTodo.addEventListener('dblclick', edit(newTodo, todoDiv));
    createDeleteButton(todoDiv);
    todoList.appendChild(todoDiv);
  });
  updateCounter(todos.length);
}

function hideClearBtn(todos) {
  var areAllActive = todos.every(function (todo) {
    return todo.status === 'active';
  });

  if (areAllActive) clearCompleted.classList.add('invisible');
  else clearCompleted.classList.remove('invisible');
}

function edit(newTodo, todoDiv) {
  return function () {
    // hide todo
    todoDiv.classList.replace('show', 'hide');
    // create edit form
    var form = document.createElement('form');
    form.classList.add('todo-edit');
    var input = document.createElement('input');
    form.appendChild(input);
    input.setAttribute('placeholder', 'What needs to be done?');
    input.setAttribute('minlength', '3');
    input.setAttribute('maxlength', '200');
    input.setAttribute('type', 'text');
    input.classList.add('todo', 'todo-item');
    input.value = newTodo.innerText;
    // "replace" todo with edit form
    todoDiv.insertAdjacentElement('afterend', form);
    // wait for submit
    input.focus();
    // submit form on blur
    input.addEventListener('blur', function () {
      form.requestSubmit();
    });
    // update todo
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      updateTodo(newTodo, form, todoDiv);
    });
  };
}

// updates todo, and div content, makes it visible again, deletes form
function updateTodo(newTodo, form, todoDiv) {
  var input = form.querySelector('input');
  var todoText = input.value.trim();
  if (validateTodoText(todoText)) {
    newTodo.innerText = input.value;
    updateProp(todoDiv, 'text', input.value);
    form.remove();
    todoDiv.classList.replace('hide', 'show');
  }
}

function validateTodoText(todoText) {
  return todoText && todoText.length >= 3 && todoText.length <= 200;
}

function getLocalTodos() {
  var todosJson = localStorage.getItem('todos');
  return todosJson ? JSON.parse(localStorage.getItem('todos')) : [];
}

function setLocalTodos(todos) {
  localStorage['todos'] = JSON.stringify(todos);
}

function createTodoDiv(createdAt) {
  var todoDiv = document.createElement('div');
  todoDiv.classList.add('todo', 'show');
  todoDiv.setAttribute('createdAt', createdAt);
  return todoDiv;
}

function createCheckBox(todoDiv, todoStatus) {
  var checkBox = document.createElement('input');
  checkBox.setAttribute('type', 'checkbox');
  checkBox.checked = todoStatus === 'completed';

  checkBox.addEventListener('change', function () {
    toggleSingle(todoDiv, checkBox);
  });

  todoDiv.appendChild(checkBox);
}

function toggleSingle(todoDiv, checkBox) {
  if (checkBox.checked) {
    updateProp(todoDiv, 'status', 'completed');
  } else {
    updateProp(todoDiv, 'status', 'active');
  }
  renderTodos(currentFilter);
}

function updateProp(todoDiv, prop, newvalue) {
  var localTodos = getLocalTodos();
  var index = localTodos.findIndex(function (todo) {
    return todo.createdAt === Number(todoDiv.getAttribute('createdAt'));
  });
  localTodos[index][prop] = newvalue;
  setLocalTodos(localTodos);
  renderTodos(currentFilter);
}

function createDeleteButton(todoDiv) {
  var deleteButton = document.createElement('button');
  deleteButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  deleteButton.classList.add('delete-btn');
  deleteButton.classList.add('invisible');

  todoDiv.appendChild(deleteButton);
  todoDiv.addEventListener('mouseover', function () {
    deleteButton.classList.remove('invisible');
  });
  todoDiv.addEventListener('mouseleave', function () {
    deleteButton.classList.add('invisible');
  });
  deleteButton.addEventListener('click', function () {
    deleteTodo(todoDiv);
  });
}

function deleteTodo(todoDiv) {
  var createdAt = Number(todoDiv.getAttribute('createdAt'));
  var todos = getLocalTodos().filter(function (todo) {
    return todo.createdAt !== createdAt;
  });
  setLocalTodos(todos);
  todoDiv.remove();
  updateCounter(todoList.getElementsByClassName('show').length);
}

function filterTodos(todos, selectedFilter) {
  var filter;
  if (selectedFilter) {
    filter = selectedFilter.getAttribute('data-filter');
    currentFilter.classList.remove('active-filter');
    currentFilter = selectedFilter;
    currentFilter.classList.add('active-filter');
  } else {
    filter = 'all';
  }
  return filter === 'all' ? todos : todos.filter(todo => todo.status === filter);
}
