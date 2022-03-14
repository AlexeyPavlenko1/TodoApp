const todoInput = document.querySelector('.todo-input');
const todoButton = document.querySelector('.todo-button');
const todoList = document.querySelector('.todo-list');
const counterElement = document.querySelector('#counter');
const filterOption = document.querySelector('.filter-todo');
const toggleAllBtn = document.getElementById('toggle-all');
const filters = [...document.querySelectorAll('.filter')];
const sorts = [...document.querySelectorAll('ul#sorting li')];
const clearCompleted = document.getElementById('clear-completed');

let currentFilter = 'all';
let counterValue;

//Event Listeners
document.addEventListener('DOMContentLoaded', renderTodos);

todoButton.addEventListener('click', addTodo);

filters.forEach(filter => {
  filter.addEventListener('click', function () {
    filterTodos(filter.getAttribute('data-filter'));
  });
});

sorts.forEach(sort => {
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
  setLocalTodos(getLocalTodos().filter(todo => todo.status !== 'completed'));
  renderTodos();
});

//Functions
function toggleAll() {
  const todos = getLocalTodos();
  const allComplete = todos.every(todo => todo.status === 'completed');

  if (allComplete) {
    todos.forEach(todo => (todo.status = 'active'));
  } else {
    todos.forEach(todo => (todo.status = 'completed'));
  }
  setLocalTodos(todos);
  renderedTodos = todoList.querySelectorAll('.todo');
  renderedTodos.forEach(element => element.remove());
  renderTodos();
}

function updateCounter(value = counterValue) {
  counterElement.innerText = `${value} ${currentFilter === 'all' ? 'total' : currentFilter}`;
}

function sortTodos(desc) {
  todoList.querySelectorAll('.todo').forEach(childNode => childNode.remove());
  const todos = getLocalTodos();
  todos.sort((first, second) => {
    const descByText = second.text.toLowerCase().localeCompare(first.text.toLowerCase());
    const descByTime = second.createdAt - first.createdAt;
    return desc ? (descByText ? descByText : descByTime) : -descByText ? -descByText : -descByTime;
  });
  setLocalTodos(todos);
  renderTodos();
}

function addTodo(e) {
  e.preventDefault();
  const todoText = todoInput.value.trim();
  if (validateTodoText(todoText)) {
    const createdAt = new Date().getTime();
    const todoDiv = createTodoDiv(createdAt, 'active');
    //checkbox
    createCheckBox(todoDiv);
    const newTodo = createNewTodoElement(todoText, todoDiv);
    saveNewTodo(todoText, createdAt);
    newTodo.addEventListener('dblclick', edit(newTodo, todoDiv));
    createDeleteButton(todoDiv);
    //attach final Todo
    todoList.appendChild(todoDiv);
  }
}

function createNewTodoElement(todoText, todoDiv) {
  const newTodo = document.createElement('li');
  newTodo.classList.add('todo-item');
  newTodo.innerText = todoText;
  todoInput.value = '';
  todoDiv.appendChild(newTodo);
  return newTodo;
}

function saveNewTodo(todoText, createdAt) {
  const todos = getLocalTodos();
  const newTodo = { text: todoText, status: 'active', createdAt: createdAt };
  todos.push(newTodo);
  localStorage.setItem('todos', JSON.stringify(todos));
  updateCounter(todos.length);
}

function renderTodos() {
  const todos = getLocalTodos();
  todos.forEach(function (todo) {
    const todoDiv = createTodoDiv(todo.createdAt, todo.status);
    createCheckBox(todoDiv, todo.status);
    const newTodo = createNewTodoElement(todo.text, todoDiv);
    newTodo.addEventListener('dblclick', edit(newTodo, todoDiv));
    createDeleteButton(todoDiv);
    todoList.appendChild(todoDiv);
  });
  hideClearBtn(todos);
  updateCounter(todos.length);
}

function hideClearBtn(todos) {
  const areAllActive = todos
    ? todos.every(todo => todo.status === 'active')
    : !document.querySelectorAll('[status="completed"]').length;
  if (areAllActive) {
    clearCompleted.style.visibility = 'hidden';
  }
}

function edit(newTodo, todoDiv) {
  return function () {
    todoDiv.style.display = 'none';
    const form = document.createElement('form');
    form.innerHTML = ` <input
        placeholder="What needs to be done?"
        minlength="3"
        maxlength="200"
      />

      <button class="save" type="submit">
      <i class="fa-solid fa-square-check"></i>
      </button>`;
    const input = form.querySelector('input');
    const button = form.querySelector('button');
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
    form.addEventListener('submit', e => {
      e.preventDefault();
      updateTodo(newTodo, form, todoDiv);
    });
  };
}

function updateTodo(newTodo, form, todoDiv) {
  const input = form.querySelector('input');
  const todoText = input.value.trim();
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
  const todosJson = localStorage.getItem('todos');
  return todosJson ? [...JSON.parse(localStorage.getItem('todos'))] : [];
}

function setLocalTodos(todos) {
  localStorage['todos'] = JSON.stringify(todos);
}

function createTodoDiv(createdAt, status) {
  const todoDiv = document.createElement('div');
  todoDiv.classList.add('todo', 'show');
  todoDiv.setAttribute('createdAt', createdAt);
  todoDiv.setAttribute('status', status);
  return todoDiv;
}

function createCheckBox(todoDiv, todoStatus = 'active') {
  const checkBox = document.createElement('input');
  checkBox.setAttribute('type', 'checkbox');
  checkBox.checked = todoStatus === 'completed';

  checkBox.addEventListener('change', function () {
    toggleSingle(todoDiv, checkBox);
  });

  todoDiv.appendChild(checkBox);
}

function toggleSingle(todoDiv, checkBox) {
  const todo = todoDiv.querySelector('.todo-item');
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
  const localTodos = getLocalTodos();
  const index = localTodos.findIndex(todo => todo.createdAt === Number(todoDiv.getAttribute('createdAt')));
  localTodos[index][prop] = newvalue;
  setLocalTodos(localTodos);
  filterTodos();
}

function createDeleteButton(todoDiv) {
  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
  deleteButton.classList.add('delete-btn');
  todoDiv.appendChild(deleteButton);
  todoDiv.addEventListener('mouseover', () => {
    deleteButton.style.visibility = 'visible';
  });
  todoDiv.addEventListener('mouseleave', () => {
    deleteButton.style.visibility = 'hidden';
  });
  deleteButton.addEventListener('click', function () {
    deleteTodo(todoDiv);
  });
}

function deleteTodo(todoDiv) {
  const createdAt = Number(todoDiv.getAttribute('createdAt'));
  const todos = getLocalTodos().filter(todo => todo.createdAt !== createdAt);
  setLocalTodos(todos);
  todoDiv.remove();
  updateCounter(todoList.getElementsByClassName('show').length);
}

function filterTodos(filter = currentFilter) {
  let itemsToHide = document.querySelectorAll(` .todo:not([status='${filter}'])`);
  let itemsToShow = document.querySelectorAll(`.todo[status='${filter}']`);
  if (filter === 'all') {
    itemsToHide = [];
    itemsToShow = document.querySelectorAll('.todo-list [status]');
  }

  itemsToHide.forEach(el => {
    el.classList.add('hide');
    el.classList.remove('show');
  });

  itemsToShow.forEach(el => {
    el.classList.remove('hide');
    el.classList.add('show');
  });

  currentFilter = filter;
  updateCounter(itemsToShow.length);
}
