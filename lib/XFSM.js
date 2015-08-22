/* jshint loopfunc:true */

var RuleSet = require('./RuleSet');
var EventEmitter = require('events').EventEmitter;

var XFSM = function (ruleSet, actionListener) {
    this._init(ruleSet, actionListener);
};
XFSM.prototype = {
    _init: function (ruleSet, actionListener) {
        /*
        this.eventQueue = new LinkedBlockingQueue<>();
        this.ruleSet = ruleSet;
        this.actionListener = actionListener;
        */

        this.currentStateName = '';
        this.ruleSet = ruleSet || {};
        this.actionListener = actionListener || {};
        this.emitter = new EventEmitter();
    },
    getRuleSet: function () {
        return this.ruleSet;
    },
    setRuleSet: function (ruleSet) {
        this.ruleSet = ruleSet;
    },
    getCurrentStateName: function () {
        return this.currentStateName;
    },
    setCurrentStateName: function (currentStateName) {
        this.currentStateName = currentStateName;
    },
    getCurrentState: function () {
        return this.ruleSet.states[this.currentStateName] || null;
    },
    getActionListener: function () {
        return this.actionListener;
    },
    init: function () {
        this._register();
        this.emit(this.ruleSet.initialEvent);
    },
    emit: function (eventame) {
        this.emitter.emit(eventame);
    },
    isFunction: function (fnname) {
        return fnname && typeof this.actionListener[fnname] === 'function';
    },
    _register: function () {
        var self = this;
        var states = this.ruleSet.states;
        var transitions = this.ruleSet.transitions;
        for(var namefrom in transitions) {
            var eventName = null,
                from = null;
            if (namefrom === this.initialEvent) {
                eventName = namefrom;
            } else {
                eventName = namefrom.split('@')[0];
                from = namefrom.split('@')[1];
            }

            var eventname = transitions[namefrom].event;
            if (!eventname) {
                continue;
            }
            
            (function (eventname, from, namefrom) {
                self.emitter.on(eventname, function () {
                    //out
                    if (from && states[from]) {
                        var onExit = states[from].onExit;
                        if (onExit && self.isFunction(onExit)) {
                            self.actionListener[onExit]();
                        }
                    }

                    //event
                    var onTransition = transitions[namefrom].onTransition;
                    if (onTransition && self.isFunction(onTransition)) {
                        self.actionListener[onTransition]();
                    }

                    //in
                    self.currentStateName = transitions[namefrom].toStateName;
                    var to = transitions[namefrom].toStateName;
                    if (to && states[to]) {
                        var onEnter = states[to].onEnter;
                        if (onEnter && self.isFunction(onEnter)) {
                            self.actionListener[onEnter]();
                        }
                    }
                });
            })(eventname, from, namefrom);
        }
    }
};

module.exports = XFSM;
