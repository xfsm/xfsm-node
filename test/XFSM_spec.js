var main = require('../main');

var RuleSet = main.RuleSet;
var XFSM = main.XFSM;



var ruleSet = new RuleSet();
ruleSet.state("init", "at home", "at street")
        .state("hello", "say hello", "say bye")
        .initialState("init")
        .transition("go_out", "init", "hello", "take a taxi")
        .transition("go_home", "hello", "init", "take a bus");

console.log(ruleSet);

var listener = {
    "at home" : function () {
        console.log("init:onEnter");
    },
    "at street" : function () {
        console.log("init:onExit");
    },
    "say hello" : function () {
        console.log("hello:onEnter");
    },
    "say bye" : function () {
        console.log("hello:onExit");
    },
    "take a taxi" : function () {
        console.log("go_out: init to hello");
    },
    "take a bus" : function () {
        console.log("go_home: hello to init");
    }
};

var xfsm = new XFSM(ruleSet, listener);
xfsm.init();
xfsm.emit("go_out");
xfsm.emit("go_home");
xfsm.emit("go_out");

var fs = require('fs');
var data = fs.readFileSync(__dirname + '/fsm.json', {encoding: 'utf8'});
var ruleSet2 = new RuleSet().fromJson(data);
console.log(ruleSet2);
var listener2 = {
    "SAY_I_AM_BACK": function () {
        console.log("SAY_I_AM_BACK");
    },
    "SAY_I_WILL_BE_BACK": function () {
        console.log("SAY_I_WILL_BE_BACK");
    },
    "YO_FRIENDS": function () {
        console.log("YO_FRIENDS");
    },
    "BYE_FRIENDS": function () {
        console.log("BYE_FRIENDS");
    },
    "HAVE_DINNER": function () {
        console.log("HAVE_DINNER");
    }
};
var xfsm2 = new XFSM(ruleSet2, listener2);
xfsm2.init();

xfsm2.emit("EV_AM8");

xfsm2.emit("EV_PM7");

xfsm2.emit("EV_AM8");


