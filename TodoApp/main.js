'use strict';

(function () {
  var view = getView();
  var model = getModel();
  var repository = todoRepository();

  // Move model management into separate class
  var currentFilter = 'all';
  var activeFilterElement;

  //Event Listeners

  view.form.addEventListener('submit', addTodo);

  Object.keys(model.sorts)
    .map(function (key) {
      return model.sorts[key];
    })
    .forEach(function (sort) {
      var sortListItem = renderSortItem(sort, view);
      sortListItem.addEventListener('click', function () {
        renderTodos(null, sort);
      });
    });

  function renderSortItem(sort, view) {
    var sortListItem = document.createElement('li');
    sortListItem.innerText = '[' + sort + ']';
    view.sortsList.appendChild(sortListItem);
    return sortListItem;
  }

  view.toggleAllBtn.addEventListener('click', toggleAll);

  view.clearCompleted.addEventListener('click', onClickClearCompleted);

  function onClickClearCompleted() {
    emptyTodoList();
    clearCompletedLocal();
    renderTodos();
  }

  function clearCompletedLocal() {
    repository.setTodos(
      repository.getTodos().filter(function (todo) {
        return todo.status !== 'completed';
      })
    );
  }

  function toggleAll() {
    var todos = repository.getTodos();
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
    repository.setTodos(todos);
    // TODO: Move into separate variable (class property)
    renderTodos();
  }

  function updateCounter(filteredTodosNumber) {
    var counterText = ' ' + (currentFilter === 'all' ? 'total' : currentFilter);
    view.counterElement.innerText = filteredTodosNumber + counterText;
  }

  function sortTodos(todos, sort) {
    var isDescSort = sort === model.sorts.desc;
    todos.sort(function (first, second) {
      var descByText = second.text.toLowerCase().localeCompare(first.text.toLowerCase());
      var descByTime = second.createdAt - first.createdAt;
      var compareResult;
      if (descByText !== 0) {
        compareResult = isDescSort ? descByText : -descByText;
      } else {
        compareResult = isDescSort ? descByTime : -descByTime;
      }
      return compareResult;
    });
    return todos;
  }

  function addTodo(e) {
    e.preventDefault();
    var todoText = view.todoInput.value.trim();
    if (validateTodoText(todoText)) {
      var createdAt = new Date().getTime();
      saveNewTodo(todoText, createdAt);
      emptyTodoInput(view);
      renderTodos();
    }
  }

  function createNewTodoElement(todoText) {
    var newTodo = document.createElement('li');
    newTodo.classList.add('todo-item');
    newTodo.textContent = todoText;
    return newTodo;
  }

  function saveNewTodo(todoText, createdAt) {
    var todos = repository.getTodos();
    // TODO: Move into class
    var newTodo = { text: todoText, status: 'active', createdAt: createdAt };
    todos.push(newTodo);
    localStorage.setItem('todos', JSON.stringify(todos));
    updateCounter(todos.length);
  }

  function renderTodos(filter, sort) {
    // TODO: Move into separate variable (class property)
    emptyTodoList();
    var todos = repository.getTodos();
    hideClearBtn(todos);
    todos = filterTodos(todos, filter);
    if (sort !== undefined) {
      sortTodos(todos, sort);
    }
    todos.forEach(function (todo) {
      renderSingleTodo(todo, view.todoList);
    });
    updateCounter(todos.length);
  }

  function hideClearBtn(todos) {
    var areAllActive = todos.every(function (todo) {
      return todo.status === 'active';
    });

    view.clearCompleted.classList.toggle('invisible', areAllActive);
  }

  function switchFilter(oldfilter, newFilter) {
    if (oldfilter) {
      oldfilter.classList.remove('active-filter');
    }
    activeFilterElement = newFilter;
    activeFilterElement.classList.add('active-filter');
  }

  function renderSingleTodo(todo, todoList) {
    var todoDiv = createTodoDiv();
    createCheckBox(todo.createdAt, todoDiv, todo.status);
    var newTodo = createNewTodoElement(todo.text);
    emptyTodoInput(view);
    todoDiv.appendChild(newTodo);
    newTodo.addEventListener('dblclick', onDbClickEdit(todo.createdAt, newTodo, todoDiv));
    createDeleteButton(todoDiv, todo.createdAt);
    todoList.appendChild(todoDiv);
  }

  function onDbClickEdit(createdAt, newTodo, todoDiv) {
    return function () {
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
      todoDiv.parentNode.replaceChild(form, todoDiv);
      input.focus();
      input.addEventListener('blur', function () {
        form.requestSubmit();
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        editLocalTodo(createdAt, form);
        renderTodos();
      });
    };
  }

  function editLocalTodo(createdAt, form) {
    var input = form.querySelector('input');
    var todoText = input.value.trim();
    if (validateTodoText(todoText)) {
      updateProp(createdAt, 'text', todoText);
    }
  }

  function validateTodoText(todoText) {
    return todoText.length >= 3 && todoText.length <= 200;
  }

  function createTodoDiv() {
    var todoDiv = document.createElement('div');
    todoDiv.classList.add('todo', 'show');
    return todoDiv;
  }

  function createCheckBox(createdAt, todoDiv, todoStatus) {
    var checkBox = document.createElement('input');
    checkBox.setAttribute('type', 'checkbox');
    checkBox.checked = todoStatus === 'completed';

    checkBox.addEventListener('change', function () {
      toggleSingle(createdAt, checkBox.checked);
      renderTodos();
    });

    todoDiv.appendChild(checkBox);
  }

  function toggleSingle(createdAt, isChecked) {
    if (isChecked) {
      updateProp(createdAt, 'status', 'completed');
      renderTodos();
    } else {
      updateProp(createdAt, 'status', 'active');
      renderTodos();
    }
  }

  function updateProp(createdAt, prop, newValue) {
    var localTodos = repository.getTodos();
    var index = localTodos.findIndex(function (todo) {
      return todo.createdAt === createdAt;
    });
    localTodos[index][prop] = newValue;
    repository.setTodos(localTodos);
  }

  function createDeleteButton(todoDiv, createdAt) {
    var deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-btn');
    deleteButton.classList.add('invisible');
    deleteButton.appendChild(document.createElement('i'));

    todoDiv.appendChild(deleteButton);
    todoDiv.addEventListener('mouseover', function () {
      deleteButton.classList.remove('invisible');
    });
    todoDiv.addEventListener('mouseleave', function () {
      deleteButton.classList.add('invisible');
    });
    deleteButton.addEventListener('click', function () {
      deleteTodo(createdAt);
    });
  }

  function deleteTodo(createdAt) {
    var todos = repository.getTodos().filter(function (todo) {
      return todo.createdAt !== createdAt;
    });
    repository.setTodos(todos);
    renderTodos();
  }

  function filterTodos(todos, filter) {
    filter = filter || currentFilter;
    return filter === 'all'
      ? todos
      : todos.filter(function (todo) {
          return todo.status === filter;
        });
  }

  function renderFilters() {
    var filtersDiv = document.createElement('div');
    filtersDiv.classList.add('filters');
    var filtersUl = document.createElement('ul');
    filtersDiv.appendChild(filtersUl);
    Object.keys(model.filters)
      .map(function (key) {
        return model.filters[key];
      })
      .forEach(function (filter) {
        var filterText = filter.toUpperCase();
        var filterElement = document.createElement('li');
        filterElement.classList.add('filter');
        filterElement.innerText = filterText;
        filtersUl.appendChild(filterElement);
        filterElement.addEventListener('click', function () {
          switchFilter(activeFilterElement, filterElement);
          currentFilter = filter;
          renderTodos(filter);
        });
      });
    view.todoContainer.insertAdjacentElement('afterend', filtersDiv);
  }

  function emptyTodoInput(view) {
    view.todoInput.value = '';
  }

  function emptyTodoList() {
    view.todoList.innerHTML = '';
  }

  // In general
  // Try to create three core files: controller, model | repository, view | renderer js files
  // Additional files: main (something like config, high-level setup), utils (non feature specific helpers), storage (app specific, could be eny kind of storage)

  //Script
  renderTodos('all');
  renderFilters();
})();
