// This file contains code for multiple random questions in a CC exercise
// When the user clicks run, the anonymous function runs. It checks whether 
// this.currentCycle exists. 
// If it doesn't, we assume a first-run and initialize a currentCycle using
// makeCycle and add it to this. 
// If it *does*, we evaluate the current cycle, which can do anything it wants,
// as defined in the exercises makeCycle function.

// In the makeCycle below, each cycle will display a random question of the
// form "Use a single statement to declare the variables named `xxx` and `yyy`."
// You can try it out by navigating to:
// http://www.codecademy.com/courses/novice-variables/2?preview=true#!/exercises/1



// makeCycle: contains the specifics of the cycle(s) used by a particular exercise
var makeCycle = function makeCycle(scope, identifyCycle) {
    var utils = submissionTestUtils(CC);
    var cycle = {};
    var state = {};
    state.i = 0;
    state.maxCycles = 3;

    
    (function initializeState(){
        state.parts = ["variableNames", // For the first variable
            "variableNames", // For the second variable
            "writingInstructions",
            "values",
            "values",
            "quotes",
            "assignmentInstructions",
            "printingInstructions"
            ];
        state[state.parts[0]] = ["alpha", "bravo", "charlie", 
            "delta", "echo", "foxtrot", "golf", "hotel", "india", 
            "juliet", "kilo", "lima", "mike", "november", "oscar", 
            "papa", "quebec", "romeo", "sierra", "tango", "uniform", 
            "victor", "whiskey", "xray", "yankee", "zulu"];
        state[state.parts[2]] = ["Define",
            "Declare",
            "Create",
            "Make"];
        state[state.parts[3]] = [1,54,73,007,"Number 6", "Room 101",
            42, 5440, "News at 11", "Ours is not to wonder why",
            87, "42 Below", "Once more into the breach", 
            "Now comes the mystery", "A fine mess", 1984, 2001, 
            2010];
        state[state.parts[5]] = ["'", '"'];
        state[state.parts[6]] = ["assign the value %value% to the variable named `%variableName%`",
            "assign %value% to `%variableName%`",
            "put the value %value% into the variable named `%variableName%`",
            "put %value% into `%variableName%`",
            "set the variable named `%variableName%` to the value %value%",
            "set the variable named `%variableName%` to the value %value%",
            ];
        state[state.parts[7]] = ["print the value of the variable named `%variableName%` to the console",
            "print `%variableName%` to the console",
            "log the value of the variable named `%variableName%` to the console",
            "log `%variableName%` to the console",
            "get the value of the variable named `%variableName%` and log it to the console",
            "get `%variableName%` and log it to the console",
            "get the value of the variable named `%variableName%` and print it to the console",
            "get `%variableName%` and print it to the console"
            ];
        
        state.indices = [];
    })();
    
    (function (state) {
        var o = {};
        (function randomQuestions() {
            var maxPreviousCount = 1;
            o.ensurePreviousCycle = function ensurePreviousCycle() {
                utils.logWrap(function () {
                    if (!utils.isDefined(state, "prev")) {
                        var o = {};
                        o.indices = [];
                        state.prev = o;
                    }
                });
            };
            o.checkPrevious = function checkPrevious(index, value) {
                o.ensurePreviousCycle();
                while (state.prev.indices.length <= index) {
                    state.prev.indices.push([]);
                }
                var returnVal = true;
                var previousValues = state.prev.indices[index];
                var matches = previousValues.filter(
                    function(val, idx, array) {
                        return val === value;
                });
                if (matches.length > 0) {
                    console.log("Already tried.");
                    returnVal = false;
                } else {
                    console.log("Never tried.");
                    console.log(value);
                    console.log(previousValues);
                    console.log(matches);
                    previousValues.push(value);
                    previousValues = previousValues.slice(previousValues.length - maxPreviousCount);
                    returnVal = true;
                }
                state.prev.indices[index] = previousValues;
                return returnVal;
            };
            o.getRandomValueForIndex = function getRandomValueForIndex(index) {
                var value;
                // Only check for previous values if there are more options than the max
                var check = maxPreviousCount < state[state.parts[index]].length;
                var success = true;
                do {
                    value = Math.floor(Math.random() * state[state.parts[index]].length)
                    utils.logWrap(function () {
                        if (check) {
                            success = o.checkPrevious(index, value);
                            console.log(success);
                        }
                    });
                } while (!success);
                return value;
            }
            o.randomQuestion = function randomQuestion() {
                for (var i=0; i<state.parts.length; i++) {
                    state.indices[i] = o.getRandomValueForIndex(i);
                }
            };
        })();

        o.getPartAtIndex = function getPartAtIndex(part, index) {
            return state[state.parts[part]][state.indices[index]];
        };
        o.getAnotherEntry = function(part, index, entryFunc) {
            var returnVal = o.getPartAtIndex(part,index);
            while (returnVal === entryFunc()) {
                state.indices[index] = Math.floor(Math.random()*state[state.parts[part]].length);
                returnVal = o.getPartAtIndex(part,index);
            }
            return returnVal;
        }
        o.getFirstVariableName = function getFirstVariableName() {
            return o.getPartAtIndex(0,0);
        };
        o.getSecondVariableName = function getSecondVariableName() {
            return o.getAnotherEntry(1,1,o.getFirstVariableName);
        };
        o.getWritingInstruction = function getWritingInstruction() {
            return o.getPartAtIndex(2,2);
        };
        o.getFirstValue = function getFirstValue() {
            return o.getPartAtIndex(3,3);
        };
        o.getSecondValue = function getSecondValue() {
            return o.getAnotherEntry(4,4,o.getFirstValue);
        };
        o.getQuote = function getQuote() {
            return o.getPartAtIndex(5,5);
        };
        o.getValueInstructions = function getValueInstructions(value) {
            var quote = o.getQuote();
            if (typeof(value) === 'string') {
                value = quote + value + quote;
            }
            return value;
        }
        o.getAssignmentInstructions = function getAssignmentInstructions(value, variableName) {
            return o.getPartAtIndex(6,6).replace("%value%", o.getValueInstructions(value)).replace("%variableName%", variableName);
        }
        o.getPrintingInstructions = function getPrintingInstructions(variableName) {
            return o.getPartAtIndex(7,7).replace("%variableName%", variableName);
        }
        o.instructions = function instructions() {
            var variableName = o.getFirstVariableName();
            var variableName2 = o.getSecondVariableName();
            var value = o.getFirstValue();
            var value2 = o.getSecondValue();
            console.log("    (Ignore the 'Oops, try again.' message for now.)");
            console.log("Use a single statement to " + o.getWritingInstruction() + " the variables named `" + variableName + "` and `" + variableName2 + "`.");
        };
        o.functionTakesNParameters = function functionTakesNParameters(scope, functionName, parameterCount) {
            if (scope[functionName].length !== parameterCount) {
                console.log("Make sure that function `" + functionName + "` takes exactly " + parameterCount + " parameters.");
                return false;
            }
            return true;
        };
        o.functionIsCalledWithNParameters = function functionIsCalledWithNParameters(scope, functionName, parameterCount) {
            var calls = CC.calls(functionName);
            if (!(calls.length > 0) || calls[0].length !== parameterCount) {
                console.log("Make sure that function `" + functionName + "` is called and passed exactly " + parameterCount + " parameters.");
                return false;
            }
            return true;
        };
        o.functionReturnsValue = function functionReturnsValue(scope, functionName, value) {
            var returnedValue = scope[functionName]();
            if (returnedValue !== value) {
                console.log("Make sure that function `" + functionName + "` returns " + value + ".");
                return false;
            }
            return true;
        };
        
        o.varIsAPropertyOfScope = function varIsAPropertyOfScope(scope, varName) {
            var names = Object.getOwnPropertyNames(scope);
            for (var i=0, max=names.length; i<max; i++) {
                var name = names[i];
                if (varName === name) {
                    return true;
                }
            }
            console.log("Make sure to declare the variable `" + varName + "`.")
            return false;
        }
        o.removeVarFromScope = function removeVarFromScope(scope, varName) {
            delete scope[varName];
        }
        o.varHasValue = function varHasValue(scope, variableName, value) {
            if (scope[variableName] !== value) {
                console.log("Make sure that " + variableName + " has a value of " + o.getValueInstructions(value) + ".");
                return false;
            }
            return true;
        }
        for (var name in o) {
            state[name] = o[name];
        }
    })(state);
    
    (function (cycle, identifyCycle) {
        var o = {};
        o.updateState = function updateState(scope) {
            state.i++;
            state.randomQuestion();
            state.instructions();
        };
        o.checkState = function checkState(scope, code) {
            var result = state.i === 0;
            if (!result) {
                var variableName = state.getFirstVariableName();
                var variableName2 = state.getSecondVariableName();
                var value = state.getFirstValue();
                var value2 = state.getSecondValue();
                result = true;
                result = result && state.varIsAPropertyOfScope(scope, variableName);
                result = result && state.varIsAPropertyOfScope(scope, variableName2);
                var msg = "Make sure your code includes only one declaration statement with only the requested variables and no others.";
                result = result && utils.checkForMultiDeclaration(code, msg, [variableName, variableName2]);
                state.removeVarFromScope(scope, variableName);
                state.removeVarFromScope(scope, variableName2);
            }
            return result;
        };
        o.initialState = function initialState(scope) {
            if (state.i === 0) {
                o.updateState(scope);
                return true;
            }
            return false;
        };
        o.evaluate = function evaluate(scope, code) {
            var returnVal = true;
            var consoleEntries;
            utils.logWrap(function(logger){
                if (o.initialState(scope)) {
                    returnVal = false;
                }
                else if (!o.checkState(scope, code)) {
                    state.instructions();
                    returnVal = false;
                }
                else if (state.i < state.maxCycles) {
                    console.log("Question " + state.i + " of " + state.maxCycles + " correct. Next question:");
                    o.updateState(scope);
                    returnVal = false;
                } else {
                    o.success(scope);
                    console.log("You've completed all the necessary questions to proceed to the next exercise, but you can continue practicing if you want.")
                    o.updateState(scope);
                    returnVal = true;
                }
                consoleEntries = logger.entries;
            });
            var output = "";
            for (var i=0, max=consoleEntries.length; i<max; i++) {
                output += consoleEntries[i] + "\n";
            }
            if (returnVal) {
                console.log(output);
                return true;
            }
            else
            {
                return output;
            }
        };
        o.success = function success(scope) {
            console.log("Good Job!");
        };
        o.identifyCycle = identifyCycle;
        
        for (var name in o) {
            cycle[name] = o[name];
        }
        return cycle;
    })(cycle, identifyCycle);
    return cycle;
};

// Anonymous function that manages the cycles and runs the current cycle
return (function (scope, code, makeCycle) {
    var utils = submissionTestUtils(CC);
    var o = {};
    o.cycleName = "currentCycle";
    var idName = "identifyCycle";
    o[idName] = function identifyCycle(scope) {
        return "Novice Fuctions - Function I/O - 4";
    };
    
    o.isInitialized = function isInitialized(scope, name) {
        if (!scope[name] || 
            !utils.isDefined(scope, name) ||
            !utils.isDefined(scope[name], idName)  ||
            !utils.isAFunction(scope[name], idName) ||
            scope[name][idName](scope) !== o[idName](scope))
        {
            return false;
        }
        return true;
    };
    o.initializeScope = function initializeScope(scope, name) {
        var cycle = makeCycle(scope, o[idName], code);
        scope[name] = cycle;
    };
    o.getCurrentCycle = function getCurrentCycle(scope) {
        if (!o.isInitialized(scope, o.cycleName)) {
            o.initializeScope(scope, o.cycleName);
        }
        return scope[o.cycleName];
    };
    o.evaluateCycle = function evaluateCycle(scope, code) {
        return o.getCurrentCycle(scope).evaluate(scope, code);
    };
    
    
    return o.evaluateCycle(scope, code);
})(this, code, makeCycle);
 