'use strict';

var todoInput = document.querySelector('.todo-input');
var todoButton = document.querySelector('.todo-button');
var todoList = document.querySelector('.todo-list');
var counterElement = document.querySelector('#counter');
var filterOption = document.querySelector('.filter-todo');
var toggleAllBtn = document.getElementById('toggle-all');
var filters = [].concat(_toConsumableArray(document.querySelectorAll('.filter')));
var sorts = [].concat(_toConsumableArray(document.querySelectorAll('ul#sorting li')));
var clearCompleted = document.getElementById('clear-completed');

var currentFilter = 'all';
var counterValue = void 0;

//Event Listeners
document.addEventListener('DOMContentLoaded', renderTodos);

todoButton.addEventListener('click', addTodo);

filters.forEach(function (filter) {
  filter.addEventListener('click', function () {
    filterTodos(filter.getAttribute('data-filter'));
  });
});

sorts.forEach(function (sort) {
  sort.addEventListener('click', function () {
    sortTodos(sort.innerText.toLowerCase() === 'desc');
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
  renderTodos();
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

function updateCounter() {
  var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : counterValue;
  counterElement.innerText = value + ' ' + (currentFilter === 'all' ? 'total' : currentFilter);
}

function sortTodos(desc) {
  todoList.querySelectorAll('.todo').forEach(function (childNode) {
    childNode.remove();
  });
  var todos = getLocalTodos();
  todos.sort(function (first, second) {
    var descByText = second.text.toLowerCase().localeCompare(first.text.toLowerCase());
    var descByTime = second.createdAt - first.createdAt;
    return desc ? (descByText ? descByText : descByTime) : -descByText ? -descByText : -descByTime;
  });
  setLocalTodos(todos);
  renderTodos();
}

function addTodo(e) {
  e.preventDefault();
  var todoText = todoInput.value.trim();
  if (validateTodoText(todoText)) {
    var createdAt = new Date().getTime();
    var todoDiv = createTodoDiv(createdAt, 'active');
    createCheckBox(todoDiv);
    var newTodo = createNewTodoElement(todoText, todoDiv);
    saveNewTodo(todoText, createdAt);
    newTodo.addEventListener('dblclick', edit(newTodo, todoDiv));
    createDeleteButton(todoDiv);
    todoList.appendChild(todoDiv);
  }
}

function createNewTodoElement(todoText, todoDiv) {
  var newTodo = document.createElement('li');
  newTodo.classList.add('todo-item');
  newTodo.innerText = todoText;
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

function renderTodos() {
  var todos = getLocalTodos();
  todos.forEach(function (todo) {
    var todoDiv = createTodoDiv(todo.createdAt, todo.status);
    createCheckBox(todoDiv, todo.status);
    var newTodo = createNewTodoElement(todo.text, todoDiv);
    newTodo.addEventListener('dblclick', edit(newTodo, todoDiv));
    createDeleteButton(todoDiv);
    todoList.appendChild(todoDiv);
  });
  hideClearBtn(todos);
  updateCounter(todos.length);
}

function hideClearBtn(todos) {
  var areAllActive = todos
    ? todos.every(function (todo) {
        return todo.status === 'active';
      })
    : document.querySelectorAll('.todo[status=completed]').length === 0;
  if (areAllActive) {
    clearCompleted.style.visibility = 'hidden';
  } else {
    clearCompleted.style.visibility = 'visible';
  }
}

function edit(newTodo, todoDiv) {
  return function () {
    todoDiv.style.display = 'none';
    var form = document.createElement('form');
    form.innerHTML =
      ' <input placeholder="What needs to be done?" minlength="3" maxlength="200"/>' +
      '<button class="save" type="submit"> ' +
      '<i class="fa-solid fa-square-check"></i>' +
      '</button>';
    var input = form.querySelector('input');
    var button = form.querySelector('button');
    input.setAttribute('type', 'text');
    input.classList.add('todo', 'todo-item');
    input.style.display = 'block';
    input.style.lineHeight = '7vh';
    button.style.height = '7vh';
    input.value = newTodo.innerText;
    todoDiv.insertAdjacentElement('afterend', form);
    input.focus();
    input.addEventListener('blur', function () {
      form.requestSubmit();
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      updateTodo(newTodo, form, todoDiv);
    });
  };
}

function updateTodo(newTodo, form, todoDiv) {
  var input = form.querySelector('input');
  var todoText = input.value.trim();
  if (validateTodoText(todoText)) {
    newTodo.innerText = input.value;
    updateProp(todoDiv, 'text', input.value);
    form.remove();
    todoDiv.style.display = 'flex';
  }
}

function validateTodoText(todoText) {
  return todoText && todoText.length >= 3 && todoText.length <= 200;
}

function getLocalTodos() {
  var todosJson = localStorage.getItem('todos');
  return todosJson ? [].concat(_toConsumableArray(JSON.parse(localStorage.getItem('todos')))) : [];
}

function setLocalTodos(todos) {
  localStorage['todos'] = JSON.stringify(todos);
}

function createTodoDiv(createdAt, status) {
  var todoDiv = document.createElement('div');
  todoDiv.classList.add('todo', 'show');
  todoDiv.setAttribute('createdAt', createdAt);
  todoDiv.setAttribute('status', status);
  return todoDiv;
}

function createCheckBox(todoDiv) {
  var todoStatus = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'active';

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
    todoDiv.setAttribute('status', 'completed');
    updateProp(todoDiv, 'status', 'completed');
    clearCompleted.style.visibility = 'visible';
  } else {
    todoDiv.setAttribute('status', 'active');
    updateProp(todoDiv, 'status', 'active');
    hideClearBtn();
  }
}

function updateProp(todoDiv, prop, newvalue) {
  var localTodos = getLocalTodos();
  var index = localTodos.findIndex(function (todo) {
    return todo.createdAt === Number(todoDiv.getAttribute('createdAt'));
  });
  localTodos[index][prop] = newvalue;
  setLocalTodos(localTodos);
  filterTodos();
}

function createDeleteButton(todoDiv) {
  var deleteButton = document.createElement('button');
  deleteButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  deleteButton.classList.add('delete-btn');
  todoDiv.appendChild(deleteButton);
  todoDiv.addEventListener('mouseover', function () {
    deleteButton.style.visibility = 'visible';
  });
  todoDiv.addEventListener('mouseleave', function () {
    deleteButton.style.visibility = 'hidden';
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

function filterTodos() {
  var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : currentFilter;

  var itemsToHide = document.querySelectorAll(" .todo:not([status='" + filter + "'])");
  var itemsToShow = document.querySelectorAll(".todo[status='" + filter + "']");
  if (filter === 'all') {
    itemsToHide = [];
    itemsToShow = document.querySelectorAll('.todo-list [status]');
  }

  itemsToHide.forEach(function (el) {
    el.classList.add('hide');
    el.classList.remove('show');
  });

  itemsToShow.forEach(function (el) {
    el.classList.remove('hide');
    el.classList.add('show');
  });

  currentFilter = filter;
  updateCounter(itemsToShow.length);
}

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  } else {
    return Array.from(arr);
  }
}
