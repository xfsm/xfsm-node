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
    parseUmlToObj: function (uml) {
        uml = uml.split("@startuml")[1].split("@enduml")[0].trim().split('\n');
        console.log(uml);

        var paserRegExp = {
            STATE: new RegExp("State (\\S+?)$", "g"),
            STATE_IN: new RegExp("(\\S+) : in '(.+?)'$", "g"),
            STATE_OUT: new RegExp("(\\S+) : out '(.+?)'$", "g"),
            INIT_STATE: new RegExp("\\[\\*\\] --> (.+?) : event '(\\S+?)'$", "g"),
            INIT_STATE_DO: new RegExp("\\[\\*\\] --> (.+?) : event '(\\S+?)' do '(\\S+?)'$", "g"),
            EVENT_DO: new RegExp("(\\S+?) --> (\\S+?) : event '(\\S+?)' do '(\\S+?)'$", "g"),
            EVENT: new RegExp("(\\S+?) --> (\\S+?) : event '(\\S+?)'$", "g")
        };

        var list = [];
        uml.forEach(function (cmdline) {
            var result;
            for (var cmd in paserRegExp) {
                result = paserRegExp[cmd].exec(cmdline);
                if (result) {
                    list.push({cmd: cmd, data: result});
                    break;
                }
            }
        });

        var data = {
            initialState: '__init__',
            states: {},
            transitions: {}
        };
        list.forEach(function (line) {
            switch(line.cmd) {
                case "STATE" :
                    data.states[line.data[1]] = {
                        name: line.data[1]
                    };
                    break;
                case "STATE_IN":
                    data.states[line.data[1]].onEnter = line.data[2];
                    break;
                case "STATE_OUT":
                    data.states[line.data[1]].onExit = line.data[2];
                    break;
                case "INIT_STATE":
                    data.initialEvent = line.data[2];
                    break;
                case "INIT_STATE_DO":
                    data.initialEvent = line.data[2];
                    data.transitions[line.data[2]] = {
                        event: line.data[2],
                        toStateName: line.data[1],
                        onTransition: line.data[3]
                    };
                    break;
                case "EVENT_DO":
                    data.transitions[line.data[3]+'@'+line.data[1]] = {
                        event: line.data[3],
                        fromStateName: line.data[1],
                        toStateName: line.data[2],
                        onTransition: line.data[4]
                    };
                    break;
                case "EVENT" :
                    data.transitions[line.data[3]+'@'+line.data[1]] = {
                        event: line.data[3],
                        fromStateName: line.data[1],
                        toStateName: line.data[2]
                    };
                    break;
            }
        });

        return data;
    },
    fromPlantUml: function (uml) {
        this.setRuleSet(this.parseUmlToObj(uml));

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


