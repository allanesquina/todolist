;
(function(window,document) {

    'use strict';

    function Store(name) {
        this.name = name;
        this._get();
    }

    Store.prototype = {
        _save: function(data) {
            localStorage.setItem(this.name, JSON.stringify(this.data));
        },
        _get: function() {
            this.data = JSON.parse(localStorage.getItem(this.name)) || [];
        },
        add: function(data) {
            if (data) {
                this.data.push(data)
                this._save();
            }
        },
        delete: function(id) {
            if (+id > -1) {
                var index = find(this.data, 'id', +id).index;
                if (index > -1) {
                    this.data.splice(index, 1);
                    this._save();
                }
            }
        },
        edit: function(id, data) {
            if (+id > -1 && data) {
                var index = find(this.data, 'id', +id).index;
                if (index > -1) {
                    this.data[index] = data;
                    this._save();
                }
            }
        },
        get: function(id) {
            if (+id > -1) {
                return find(this.data, 'id', +id).data;
            }
            return this.data;
        }
    }

    function find(data, prop, value) {
        var t;
        for (var i = 0, l = data.length; i < l; i++) {
            if (data[i][prop] === value) {
                return {
                    data: data[i],
                    index: i
                };
                break;
            }
        }
    }

    window.Store = Store;
})(window, document);
