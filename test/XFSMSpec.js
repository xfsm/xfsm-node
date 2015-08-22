var main = require('../main');
var RuleSet = main.RuleSet;
var XFSM = main.XFSM;

var fs = require('fs');
var path = require('path');
var fsmJson = fs.readFileSync(path.join(__dirname, 'fsm.json'), {encoding: 'utf8'});

describe("XFSM", function () {

    describe("ruleset", function () {

        describe("builder", function () {

            var ruleSet;
            beforeEach(function() {
                ruleSet = new RuleSet();
                ruleSet.state("init", "at home", "at street")
                        .state("hello", "say hello", "say bye")
                        .initialState("init")
                        .transition("go_out", "init", "hello", "take a taxi")
                        .transition("go_home", "hello", "init", "take a bus");
            });

            it("should set ruleset - initialEvent", function() {
                expect(ruleSet.initialEvent).toBe("init");
            });
            it("should set ruleset - state", function() {
                expect(ruleSet.states.init.name).toBe("init");
                expect(ruleSet.states.init.onEnter).toBe("at home");
                expect(ruleSet.states.init.onExit).toBe("at street");

                expect(ruleSet.states.hello.name).toBe("hello");
                expect(ruleSet.states.hello.onEnter).toBe("say hello");
                expect(ruleSet.states.hello.onExit).toBe("say bye");

            });
            it("should set ruleset - transition", function() {
                expect(ruleSet.transitions["go_out@init"].event).toBe("go_out");
                expect(ruleSet.transitions["go_out@init"].fromStateName).toBe("init");
                expect(ruleSet.transitions["go_out@init"].toStateName).toBe("hello");
                expect(ruleSet.transitions["go_out@init"].onTransition).toBe("take a taxi");

                expect(ruleSet.transitions["go_home@hello"].event).toBe("go_home");
                expect(ruleSet.transitions["go_home@hello"].fromStateName).toBe("hello");
                expect(ruleSet.transitions["go_home@hello"].toStateName).toBe("init");
                expect(ruleSet.transitions["go_home@hello"].onTransition).toBe("take a bus");
            });
        });

        describe("fromJson", function () {

            var ruleSet = new RuleSet().fromJson(fsmJson);
            it("should set ruleset data", function() {
                expect(ruleSet.initialEvent).toBe("__init__");

                expect(ruleSet.states.HOME.name).toBe("HOME");
                expect(ruleSet.states.HOME.onEnter).toBe("SAY_I_AM_BACK");
                expect(ruleSet.states.HOME.onExit).toBe("SAY_I_WILL_BE_BACK");
                expect(ruleSet.states.SCHOOL.name).toBe("SCHOOL");
                expect(ruleSet.states.SCHOOL.onEnter).toBe("YO_FRIENDS");
                expect(ruleSet.states.SCHOOL.onExit).toBe("BYE_FRIENDS");

                expect(ruleSet.transitions["EV_AM8@HOME"].event).toBe("EV_AM8");
                expect(ruleSet.transitions["EV_AM8@HOME"].fromStateName).toBe("HOME");
                expect(ruleSet.transitions["EV_AM8@HOME"].toStateName).toBe("SCHOOL");

                expect(ruleSet.transitions["EV_PM7@SCHOOL"].event).toBe("EV_PM7");
                expect(ruleSet.transitions["EV_PM7@SCHOOL"].fromStateName).toBe("SCHOOL");
                expect(ruleSet.transitions["EV_PM7@SCHOOL"].toStateName).toBe("HOME");
                expect(ruleSet.transitions["EV_PM7@SCHOOL"].onTransition).toBe("HAVE_DINNER");
            });
        });
    });
    

    describe("XFSM", function () {

        var xfsm;
        var listener;
        beforeEach(function () {
            var ruleSet = new RuleSet().fromJson(fsmJson);
            listener = jasmine.createSpyObj('listener', [
                'SAY_I_AM_BACK', 'SAY_I_WILL_BE_BACK', 
                'YO_FRIENDS', 'BYE_FRIENDS',
                'HAVE_DINNER'
            ]);
            xfsm = new XFSM(ruleSet, listener);
        });

        it("should Enter initialEvent", function() {
            xfsm.init();
            expect(listener.SAY_I_AM_BACK).toHaveBeenCalled();
        });

        it("should Move State HOME to SCHOOL when Fire EV_AM8 event", function() {
            xfsm.init();
            xfsm.emit('EV_AM8');

            expect(listener.SAY_I_WILL_BE_BACK).toHaveBeenCalled();
            expect(listener.YO_FRIENDS).toHaveBeenCalled();
        });

        it("should Move State SCHOOL to HOME when Fire EV_PM7 event", function() {
            xfsm.init();
            xfsm.emit('EV_PM7');

            expect(listener.BYE_FRIENDS).toHaveBeenCalled();
            expect(listener.HAVE_DINNER).toHaveBeenCalled();
            expect(listener.SAY_I_AM_BACK).toHaveBeenCalled();
        });

    });

});


