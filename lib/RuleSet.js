/*global Error:true */
function checkName (name) {
    if (typeof name === 'string' && name.trim().length > 0) {
        throw new TypeError(name + ' is not string');
    }
}

function InvalidNameException(name) {
    this.name = '\'' + name + '\' is not valid. Spaces are not allowed.';
    this.message = message;
    this.stack = (new Error()).stack;
}
InvalidNameException.prototype = Error.prototype;


var RuleSet = function (initialEvent, state, transitions) {
    this._init(state, transitions);
};
RuleSet.prototype = {
    _init: function (initialEvent, states, transitions) {
        this.initialEvent = initialEvent || '__init__';
        this.states = states || {};
        this.transitions = transitions || {};
    },
    setRuleSet: function (data) {
        this.initialEvent = data.initialEvent || '__init__';
        this.states = data.states || {};
        this.transitions = data.transitions || {};
    },
    fromJson: function (json) {
        this.setRuleSet(JSON.parse(json));
        return this;
    },
    toJson: function () {
        // TODO: json data complete
        var json = '';
        return JSON.stringify(json);
    },
    fromPlantUml: function (uml) {
        // TODO: uml data parse

        return this;
    },
    toPlantUml: function () {
        // TODO: uml data complete
        return '';
    },
    initialState: function (initialEvent) {
        this.initialEvent = initialEvent;
        return this;
    },
    state: function (name, onEnter, onExit) {
        this.states[name] = {
            name: name,
            onEnter: onEnter,
            onExit: onExit
        };
        return this;
    },
    transition: function (event, from, to, action) {
        this.transitions[event + '@' + from] = {
            event: event,
            fromStateName: from,
            toStateName: to,
            onTransition: action || null
        };
        return this;
    },
    onState: function (fromState) {
        this.fromState = fromState;
        return this;
    },
    onEvent: function (event, to, action) {
        var from = this.fromState;
        this.transitions[event + '@' + from] = {
            event: event,
            fromStateName: from,
            toStateName: to,
            onTransition: action || null
        };
        return this;
    }
};

module.exports = RuleSet;


