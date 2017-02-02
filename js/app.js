;
(function(window, document) {

    'use strict';

    var ENTER_KEY = 13;
    var TodoStore = new Store('TodoList');
    var filterActive = false;
    var elementBody;
    var elementList;
    var elementInput;
    var filterButtons;
    var toRender;

    /**
     * Starts the application
     */
    function init() {
        elementBody = document.getElementsByTagName('body')[0];
        elementList = document.getElementById('todos');
        elementInput = document.getElementById('todo');
        filterButtons = document.querySelectorAll('.filter');
        changeFilterClass(filterButtons[0]);
        eventDelegation(elementBody);
        print(elementList, TodoStore.get());
        elementInput.focus();
    }

    /**
     * Create a new todo and save it
     * @param {String} desc
     * @return {Object} created todo
     */
    function addTodo(desc, i) {
        var todo = {
            description: desc,
            id: Date.now() + i,
            status: 1
        };
        TodoStore.add(todo);
        return todo;
    }

    /**
     * Changes the status active/completed
     * @param {Number} id
     */
    function toggleTodo(id) {
        var todo = TodoStore.get(id);
        todo.status = todo.status === 0 ? 1 : 0;
        TodoStore.edit(id, todo);
        return todo;
    }

    /**
     * Filter the list by using a status
     * @param {String} completed/active
     * @return {Array} Filtered list
     */
    function filterBy(status) {
        var param;
        switch (status) {
            case 'completed':
                param = 0;
                break;
            case 'active':
                param = 1;
                break;
            default:
                return;
        }

        return TodoStore.get().filter(function(todo) {
            return todo.status === param;
        })
    }

    /**
     * Remove a todo from list
     * @param {Number} id
     */
    function removeTodo(id, target) {
        TodoStore.delete(id);
        target.parentNode.parentNode.removeChild(target.parentNode);
    }

    /**
     * Render the template list to be printed
     * @param {Array} Todo list
     * @return {String} Rendered list
     */
    function render(list) {
        var template = '';
        var todo;
        var l = list.length;
        if (l > 0) {
            for (var i = 0; i < l; i++) {
                todo = list[i];
                template += renderOne(todo);
            }
        } else {
            template += '<li class="empty">Hey, you have no items to be listed.</li>';
        }
        return template;
    }

    function renderOne(todo, noWrapper) {
        var wrapperStart = '<li id="' + todo.id + '" class="item status' + todo.status + '"  >';
        var wrapperEnd = '</li>';
        var buff = '';

        if (!noWrapper) {
            buff += wrapperStart;
        }

        buff += '<span class="btnToggle active' + todo.status + '" ><i data-type="toggleTodo" data-id="' + todo.id + '"></i></span><div class="item-description-wrapper"><span class="item-description" data-type="editTodo" data-id="' + todo.id + '" id="desc' + todo.id + '">' + todo.description + '</span></div><button data-id="' + todo.id + '" type="button" data-type="button-remove" class="delete" name="button">✖</button>';

        if (!noWrapper) {
            buff += wrapperEnd;
        }

        return buff;
    }

    function update() {
        toRender = filterActive ? filterBy(filterActive) : TodoStore.get();
        print(elementList, toRender);
    }


    function updateOne(todo) {
        var el = document.getElementById(todo.id);
        el.classList.remove('status' + (todo.status === 1 ? 0 : 1));
        el.classList.add('status' + todo.status);
        el.innerHTML = renderOne(todo, true);
        el = null;
    }

    function changeFilterClass(newElement) {
        filterButtons.forEach(function(btn) {
            btn.classList.remove('active');
        });
        newElement.classList.add('active');
    }

    /**
     * Appends the template to the DOM
     * @param {Object} Target element
     * @param {Array} Todo list
     */
    function print(element, list) {
        var content = render(list);
        element.innerHTML = content;
    }

    /**
     * Adds events to the body element and handle those by
     * using data-type property to call a method
     * @param {Object} Target element (in this case, body element)
     */
    function eventDelegation(element) {
        var clickCount = 0;
        var singleClickTimer;

        var doubleClickTodo = function(target) {
            var id = target.getAttribute('data-id');
            var input = document.createElement('input');
            var todo = TodoStore.get(id);

            TodoStore.edit(id, todo);
            input.type = 'text';
            input.setAttribute('data-id', id);
            input.setAttribute('data-type', 'commitTodo');
            input.value = todo.description;
            target.innerHTML = '';
            target.parentNode.append(input);
            target.remove();
            input.focus();
        }

        // Click Object Methods
        var clickMethods = {
            'button-remove': function(target) {
                var id = target.getAttribute('data-id');
                removeTodo(+id, target);
            },
            editTodo: function(target) {
                clickCount++;
                if (clickCount === 1) {
                    singleClickTimer = setTimeout(function() {
                        clickCount = 0;
                    }, 250);
                } else if (clickCount === 2) {
                    clearTimeout(singleClickTimer);
                    clickCount = 0;
                    doubleClickTodo(target);
                }
            },
            toggleTodo: function(target) {
                var id = target.getAttribute('data-id');
                var todo = toggleTodo(id);
                if (filterActive) {
                    update();
                } else {
                    updateOne(todo);
                }
            },
            'filterCompleted': function(target) {
                var id = target.getAttribute('data-id');
                filterActive = 'completed';
                changeFilterClass(target);
                update();
            },
            'filterActive': function(target) {
                var id = target.getAttribute('data-id');
                filterActive = 'active';
                changeFilterClass(target);
                update();
            },
            'filterAll': function(target) {
                filterActive = false;
                changeFilterClass(target);
                update();
            }
        };

        // Binding click event
        element.addEventListener('click', function(event) {
            event.preventDefault();
            var target = event.target;
            var type = target.getAttribute('data-type');
            if (type && clickMethods[type]) {
                clickMethods[type](target);
            }
        }, true)

        // Keypress Object Methods
        var keypressMethods = {
            addTodo: function(event, target) {
                if (event.keyCode == ENTER_KEY) {
                    addTodo(target.value);
                    target.value = '';
                    update();
                }
            },
            commitTodo: function(event, target) {
                if (event.keyCode == ENTER_KEY) {
                    var id = target.getAttribute('data-id');
                    var todo = TodoStore.get(id);
                    todo.description = target.value;
                    todo.editMode = 0;
                    TodoStore.edit(id, todo);
                    updateOne(todo);
                }
            }
        }

        // Binding keypress event
        element.addEventListener('keypress', function(event) {
            var target = event.target;
            var type = target.getAttribute('data-type');
            if (type && keypressMethods[type]) {
                keypressMethods[type](event, target);
            }
        }, true)
    }

    window.onload = function() {
        init();
    }
})(window, document);
