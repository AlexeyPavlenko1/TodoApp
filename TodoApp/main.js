// TODO: Check usage for use strict 
'use strict';

// Don't use a global variables, encapsulate into separate class (View)
var todoInput = document.querySelector('#todo-input');
var form = document.querySelector('.wrap div form');
var todoList = document.querySelector('.todo-list');
var counterElement = document.querySelector('#counter');
var filterOption = document.querySelector('.filter-todo');
var toggleAllBtn = document.getElementById('toggle-all');
var filters = Array.from(document.querySelectorAll('.filter'));
var sorts = Array.from(document.querySelectorAll('ul#sorting li'));
var clearCompleted = document.getElementById('clear-completed');

// Move model management into separate class
var currentFilter = filters[0];

// TODO: Check if we really need to way DOMContentLoaded event
//Event Listeners
document.addEventListener('DOMContentLoaded', function () {
  renderTodos(currentFilter);
});

form.addEventListener('submit', addTodo);

filters.forEach(filter => {
  filter.addEventListener('click', function () {
    // TODO: Move model management into separate class. 
    // The filter value should be consumed by render directly or from value 
    // Ideally here we only need to change the model, controller will do next (render)
    renderTodos(filter);
  });
});

sorts.forEach(function (sort) {
  sort.addEventListener('click', function () {
    // TODO: Check if we really don't need to call sorting without active filter  
    // TODO: Move 'Desc' into constants (enum like)
    // TODO: Don't put state into Template side, move sort value into model
    renderTodos(null, sort.innerText === 'Desc');
  });
});

// Move event listener function into separate function declaration
toggleAllBtn.addEventListener('click', function (e) {
  // TODO: Check if we really need to call preventDefault
  e.preventDefault();
  toggleAll();
});

clearCompleted.addEventListener('click', function () {
  todoList.innerHTML = '';
  // TODO: Check if we really need to update locale storage according to filter
  // instead of storing filter value directly
  setLocalTodos(
    getLocalTodos().filter(function (todo) {
      // TODO: Move 'completed' and other status related values into constants (enum like)
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
  // TODO: Move into separate variable (class property)
  // TODO: Check innerHtml="" approach
  var renderedTodos = todoList.querySelectorAll('.todo');
  renderedTodos.forEach(function (element) {
    element.remove();
  });
  renderTodos();
}

// TODO: Check if we can rename/refactor to renderCounter
function updateCounter(filteredTodosNumber) {
  // TODO: Check if we need reassignment
  var value = filteredTodosNumber;
  // TODO: Move filter side outside of Template
  var filter = currentFilter.innerText.toLowerCase();
  counterElement.innerText = value + ' ' + (filter === 'all' ? 'total' : filter);
}

function sortTodos(todos, isDescSort) {
  todos.sort(function (first, second) {
    // TODO: Check string equality via ===
    var descByText = second.text.toLowerCase().localeCompare(first.text.toLowerCase());
    var descByTime = second.createdAt - first.createdAt;
    // TODO: Refactor, not clear case when 
    return isDescSort ? (descByText ? descByText : descByTime) : -descByText ? -descByText : -descByTime;
  });
  return todos;
}

function addTodo(e) {
  e.preventDefault();
  var todoText = todoInput.value.trim();
  // TODO: Move into separate method (resetTodo like)
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
  // TODO: Check if we can move reset and appending the new element to outside
  // let's keep functions SRP aligned
  todoInput.value = '';
  todoDiv.appendChild(newTodo);
  return newTodo;
}

function saveNewTodo(todoText, createdAt) {
  var todos = getLocalTodos();
  // TODO: Move into class
  var newTodo = { text: todoText, status: 'active', createdAt: createdAt };
  todos.push(newTodo);
  localStorage.setItem('todos', JSON.stringify(todos));
  updateCounter(todos.length);
}

function renderTodos(filter, isDescOrder) {
  //clear todo list
  // TODO: Check innerHtml="" approach
  // TODO: Move into separate variable (class property)
  todoList.querySelectorAll('.todo').forEach(function (childNode) {
    childNode.remove();
  });
  var todos = getLocalTodos();
  hideClearBtn(todos);
  todos = filter ? filterTodos(todos, filter) : filterTodos(todos, currentFilter);
  if (isDescOrder !== undefined) {
    sortTodos(todos, isDescOrder);
  }
  // TODO: Move function for element creation into separate method
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

  // TODO: Check https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle usage 
  if (areAllActive) clearCompleted.classList.add('invisible');
  else clearCompleted.classList.remove('invisible');
}

// TODO: Renamed according to functionality
// May we rename here to handleEdit/ onEditClick / etc. 
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
    // TODO: Make sure that approach which heavy relates on elements specific position is heavy to support / refactor
    // Check if we can adjust this by css solely ?
    todoDiv.insertAdjacentElement('afterend', form);
    // wait for submit
    input.focus();
    // submit form on blur
    input.addEventListener('blur', function () {
      form.requestSubmit();
    });
    // update todo
    form.addEventListener('submit', function (e) {
      // TODO: Refactor for consistency regarding to addTodo
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
  // TODO: Check if we can pass todoText not a string. 
  // Could be check todoText.length >= 3 && todoText.length <= 200; fair enough ?
  return todoText && todoText.length >= 3 && todoText.length <= 200;
}

// TODO: Move interaction with localStorage into separate class
function getLocalTodos() {
  var todosJson = localStorage.getItem('todos');
  return todosJson ? JSON.parse(localStorage.getItem('todos')) : [];
}

// TODO: Move interaction with localStorage into separate class
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

// TODO: Check if we can pass isChecked only instead of checkBox 
function toggleSingle(todoDiv, checkBox) {
  if (checkBox.checked) {
    updateProp(todoDiv, 'status', 'completed');
  } else {
    updateProp(todoDiv, 'status', 'active');
  }
  // TODO: Check if we can move this outside of function
  renderTodos(currentFilter);
}

// TODO: Check about lowerCamelCase
function updateProp(todoDiv, prop, newvalue) {
  var localTodos = getLocalTodos();
  var index = localTodos.findIndex(function (todo) {
    // TODO: Check that we onl need createAt value
    // Possible we don't need to compute it each time here
    // Possible we don't need to compute at here
    // Definitely we don't need to keep state at the Template 
    return todo.createdAt === Number(todoDiv.getAttribute('createdAt'));
  });
  localTodos[index][prop] = newvalue;
  setLocalTodos(localTodos);
  renderTodos(currentFilter);
}

function createDeleteButton(todoDiv) {
  var deleteButton = document.createElement('button');
  // TODO: Create element by document.createElement instead
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
    // TODO: Check if we really need to "toggle" 'active-filter' class in the middle of change for currentFilter = selectedFilter
    currentFilter.classList.remove('active-filter');
    currentFilter = selectedFilter;
    currentFilter.classList.add('active-filter');
  } else {
    filter = 'all';
  }
  return filter === 'all' ? todos : todos.filter(todo => todo.status === filter);
}

// In general
// Try to create three core files: controller, model | repository, view | renderer js files
// Additional files: main (something like config, high-level setup), utils (non feature specific helpers), storage (app specific, could be eny kind of storage)
