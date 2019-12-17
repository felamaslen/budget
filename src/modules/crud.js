"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
var actions_1 = require("~/types/actions");
var crud_1 = require("~/types/crud");
var crud_2 = require("~/constants/crud");
var actions_rt_1 = require("~/constants/actions.rt");
var actions_app_1 = require("~/constants/actions.app");
var array_1 = require("~/modules/array");
exports.fieldExists = function (value) {
    return typeof value !== 'undefined' && value !== null && !(typeof value === 'string' && !value.length);
};
function isCrudAction(action) {
    return action.type !== actions_rt_1.ERRORED;
}
function getNextOptimisticStatus(lastStatus, requestType) {
    if (requestType === crud_2.DELETE) {
        return crud_2.DELETE;
    }
    return lastStatus || requestType;
}
function getOptimisticUpdateItems(requestType, state, action, index) {
    if (requestType === crud_2.DELETE && state.items[index].__optimistic === crud_2.CREATE) {
        return array_1.removeAtIndex(state.items, index);
    }
    var newItem = action.payload || state.items[index];
    if (requestType === crud_2.UPDATE &&
        Object.keys(newItem).every(function (column) { return newItem[column] === state.items[index][column]; })) {
        return state.items;
    }
    return array_1.replaceAtIndex(state.items, index, __assign(__assign({}, newItem), { __optimistic: getNextOptimisticStatus(state.items[index].__optimistic, requestType) }));
}
function getTotals(requestType, state, nextItems, index) {
    var withoutOld = Number(state.total) - Number(state.items[index].cost);
    if (requestType === crud_2.DELETE) {
        return withoutOld;
    }
    return withoutOld + Number(nextItems[index].cost);
}
function withOptimisticUpdate(requestType, withTotals, state, action) {
    var index = state.items.findIndex(function (_a) {
        var id = _a.id;
        var _b;
        return id === ((_b = action.payload) === null || _b === void 0 ? void 0 : _b.id);
    });
    if (index === -1) {
        return {};
    }
    var items = getOptimisticUpdateItems(requestType, state, action, index);
    if (withTotals) {
        return {
            items: items,
            total: getTotals(requestType, state, items, index)
        };
    }
    return { items: items };
}
function onCreateOptimistic(columns) {
    return function (options) { return function (state, action) {
        if (!crud_1.isPayloadDefined(action.payload) ||
            columns.some(function (column) { return !exports.fieldExists(action.payload && action.payload[column]); })) {
            return {};
        }
        var _a = action.payload, fakeId = _a.fakeId, item = __rest(_a, ["fakeId"]);
        var items = state.items.concat([
            __assign(__assign({}, item), { id: fakeId || '', __optimistic: crud_2.CREATE }),
        ]);
        if (options.withTotals) {
            return {
                items: items,
                total: Number(state.total) + Number(item.cost)
            };
        }
        return { items: items };
    }; };
}
exports.onCreateOptimistic = onCreateOptimistic;
function onUpdateOptimistic() {
    return function (options) { return function (state, action) {
        return withOptimisticUpdate(crud_2.UPDATE, options.withTotals, state, action);
    }; };
}
exports.onUpdateOptimistic = onUpdateOptimistic;
function onDeleteOptimistic() {
    return function (options) { return function () {
        return withOptimisticUpdate(crud_2.DELETE, options.withTotals, state, action);
    }; };
}
exports.onDeleteOptimistic = onDeleteOptimistic;
function withoutDeleted(items) {
    return items.filter(function (_a) {
        var __optimistic = _a.__optimistic;
        return __optimistic !== crud_2.DELETE;
    });
}
exports.withoutDeleted = withoutDeleted;
var initialStateBare = { items: [] };
var initialStateWithTotals = __assign(__assign({}, initialStateBare), { total: 0 });
function makeInitialState(_a) {
    var withTotals = _a.withTotals;
    if (withTotals) {
        return initialStateWithTotals;
    }
    return initialStateBare;
}
function crudReducer(_a) {
    var _b = _a === void 0 ? {
        handlers: {}
    } : _a, handlers = _b.handlers, _c = _b.withTotals, withTotals = _c === void 0 ? false : _c;
    var options = {
        withTotals: withTotals
    };
    var initialState = makeInitialState(options);
    return function (state, action) {
        if (state === void 0) { state = initialState; }
        if (actions_1.isErrorAction(action) && action.actionType in handlers) {
            var onError = handlers[action.actionType].onError;
            if (onError) {
                return __assign(__assign({}, state), onError(options)(state, action));
            }
            return state;
        }
        if (action.type === actions_app_1.LOGGED_OUT) {
            return initialState;
        }
        if (!(isCrudAction(action) && action.type in handlers)) {
            return state;
        }
        var _a = handlers[action.type], onSend = _a.onSend, onReceive = _a.onReceive;
        if (!action.__FROM_SOCKET__ && onSend) {
            return __assign(__assign({}, state), onSend(options)(state, action));
        }
        if (action.__FROM_SOCKET__ && onReceive) {
            return __assign(__assign({}, state), onReceive(options)(state, action));
        }
        return state;
    };
}
exports.crudReducer = crudReducer;
