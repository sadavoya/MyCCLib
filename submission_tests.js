
function submissionTestUtils(CC) {
    var returnVal = {};
    returnVal.CC = CC;
    
    // Define all the util functions inside the following anonymous function
    (function (that) {
        var o = {};
        
        // Set up CC if necessary
        o.getCC = function getCC() {
            if (!that.CC) {
                that.CC = {};
            }
            var CC = that.CC;
            if (!CC.calls) {
                CC.callsList = {};
                CC.addCall = function(func, args) {
                    CC.callsList[func] = args;
                };
                CC.calls = function(func) {
                    return CC.callsList[func];
                };
            }
            if (!CC.equals) {
                CC.equals = function(x, y) {
                    return "" + x === "" + y;
                };
            }
            return that.CC;
        };
        // Swap scope[functionName] with newFunction for the duration of wrappedFunction
        o.swapWrap = function(scope, functionName, newFunction, wrappedFunction) {
            return function f(args) {
                var oldFunction = scope[functionName];
                try {
                    scope[functionName] = newFunction;
                    wrappedFunction(args);
                }
                finally {
                    scope[functionName] = oldFunction;
                }
            };
        };
        // Swap out the console.log method for duration of func. func can use logger.log.
        // The log entries made by functions called by func will be included in 
        // func's "logger.entries" array and NOT printed to the console
        o.logWrap = function logWrap(func) {
            var logger = {};
            logger.log = console.log;
            logger.entries = [];
            o.swapWrap(console, "log",
                function (entry) {
                    logger.entries[logger.entries.length] = entry;
                },
                function () {
                    func(logger);
                }
            )();
            return;
        };
        // A test to see if the var "varName" is defined in the specified scope
        o.isDefined = function isDefined(scope, varName) {
            var variable = scope[varName];
            var result = variable;
            if (!result) {
                console.log("Make sure " + varName + " is defined.");
            }
            return result;
        };
        // A test to see if funcName is a *function* defined in the specified scope
        o.isAFunction = function isAFunction(scope, funcName) {
            var func = scope[funcName];
            var result = typeof(func) === "function";
            if (!result) {
                console.log("Make sure " + funcName + " is a function.");
            } 
            return result;
        };
        // Tests whether name is a variable defined in scope, and if so, whether name is a *function* defined in scope
        o.isDefinedAndAFunction = function isDefinedAndAFunction(scope, name) {
            return o.isDefined(scope, name) && o.isAFunction(scope, name);
        };
        // A test to see if the function funcName is called with the arguments "args"
        o.funcIsCalledWithArgs = function funcIsCalledWithArgs(funcName, args, msg) {
            if (!Object.hasOwnProperty.call(args, "length")) {
                var tmp = args;
                args = [];
                args.push(tmp);
            }
            
            var callArgsList = o.getCC().calls(funcName);
            var callArgsListLength;
            if (callArgsList) {
                callArgsListLength = o.getCC().calls(funcName).length;
            }
            //console.log(callArgsList);
            //console.log(args);
            
            var result = callArgsList && callArgsListLength && 
                o.getCC().equals(callArgsList, args);
            if (!result) {
                var max = args.length;
                var argList = "";
                for (var i = 0; i<max; i+=1) {
                    if (argList.length > 0) { argList += ", "; }
                    argList += args[i];
                }
                
                var errorMsg = "Make sure to call " + funcName;
                if (argList.length > 0) {
                    errorMsg += ", passing the parameter(s) (" + argList + ")";
                }
                errorMsg += ".";
                if (msg) {
                    errorMsg += " " + msg;
                }
                console.log(errorMsg);
            }
            return result;
        };
        // A test to see if the function funcName, when passed a function called targetName,
        //    will call targetName during its execution
        o.funcCallsTarget = function funcCallsTarget(scope, funcName, targetName) {
            var result = false;
            var target = function() {
                result = true;
            };
            scope[funcName](target);
            if (!result) {
                console.log("Make sure that " + funcName + " calls " + targetName);
            }
            return result;
        };
        
        // A test to see if expected equals actual
        o.assertAreEqual = function assertAreEqual(expected, actual, msg) {
            var result = expected === actual;
            if (!result) {
                console.log(msg);
            }
            return result;
        };
        
        // A test to see if expected does not equal actual
        o.assertAreNotEqual = function assertAreNotEqual(expected, actual, msg) {
            var result = expected !== actual;
            if (!result) {
                console.log(msg);
            }
            return result;
        };
        
        // At test to see whether error is truthy, and if so, whether to allow it to occur or not
        o.errorOccurred = function errorOccurred(error, allow, msg) {
            if (error && allow) {
                console.log(msg);
                return true;
            }
            return false;
        };
        
        // Replace the function "funcName", defined in scope,
        /*
        // with a function that returns the result of calling
        // "funcToSwapIn". At the end of each call to the 
        // returned function, if any of the following are true:
        //     a) restoreWhen is undefined OR
        //     b) restoreWhen is true OR
        //     c) restoreWhen() is truthy
        // the old "funcName" function will be restored in scope
        */
        o.swapScopeFunction = function swapScopeFunction(scope, funcName, funcToSwapIn, restoreWhen) {
            // Save old function for later
            var oldFunc = scope[funcName];
            var newFunc = function () {
                var argsPassed = Array.prototype.slice.apply(arguments);
                try {
                    return funcToSwapIn.apply(scope, argsPassed);
                }
                finally {
                    // Restore the old function
                    if (restoreWhen === undefined || restoreWhen === true || restoreWhen()) {
                        scope[funcName] = oldFunc;            
                    }
                }
            };
            // Replace the old function 
            scope[funcName] = newFunc;
        };
        // Check to see if func1, defined in scope, calls func2, also defined in scope.
        /*
        // The test passes if func1, when passed argsForFunc1, calls func2
        // AND testFunc returns true when passed the parameters passed by func1 
        // to func2
        */
        o.func1CallsFunc2WithArgs = function func1CallsFunc2WithArgs(scope, func1, func2, testFunc, argsForFunc1) {
            var result = false;
            
            var msg = "";
            // Create a new func2...
            var newFunc2 = function() {
                var param = {args: Array.prototype.slice.apply(arguments), msg: msg};
                result = testFunc(param);
                msg = param.msg;
            };
            // ...and replace old func2 with it
            o.swapScopeFunction(scope, func2, newFunc2);
            
            // Now call func1.
            // The test passes if func1 calls func2 at some point
            scope[func1](argsForFunc1);
            
            // If the test fails, display the message
            if (msg && msg.length > 0) {
                msg = ", " + msg;
            }
            if (result === false) {
                console.log("Make sure that " + func1 + " calls " + func2 + msg + ".");
            }
            
            return result;
        };

        // Check to see if func1, defined in scope, calls func2, also defined in scope, n times.
        o.func1CallsFunc2_nTimes = function func1CallsFunc2_nTimes(scope, func1, func2, n, extraMsg) {
            var callCount = 0;
            var called = false;
            var counting = true;
            o.swapScopeFunction(scope, func2,
                function () { 
                    if (counting) {
                        callCount++;
                    }
                },
                function () {
                    return called;
                });
            scope[func1]();
            called = true;
            counting = false;
            scope[func2](); // Restore old func2
            
            var result = true;
            if (callCount !== n) {
                result = false;
                var msg = "";
                if (extraMsg) {
                    msg = " " + extraMsg;
                }
                console.log("Make sure function `" + func1 + "` calls function `" + func2 + "` " + n + " times. Currently " + func2 + " is called " + callCount + " times." + msg);
            }
            return result;
        };

        // Check the specified code to see if the student initialized a variable
        // i.e. used a single statement to declare and ONE variable and set it's
        // value - "var varName = value;"
        o.checkForInitialize = function checkForInitialize(code, varName, value) {
            var valueString = "" + value;
            if (typeof(value) === "string") {
                valueString = "(\\" + "'" + "{0,1}|\\" + '"' + "{0,1})" + value + "\\1";
            }
            var whiteSpace = "(?:\\s|\\n|\\f|\\r)";
            var parser = new RegExp("var" + whiteSpace + "+"+ varName + whiteSpace +  "*=" + whiteSpace + "*" + valueString + whiteSpace + "*;","gm");
            var matches = parser.exec(code);
            var result = false;
            if (matches && matches.length > 0) {
                result = true;
            }
            return result;
        };
        // (Needs work) Contructs a regex value string - wraps strings in quotes
        // and leaves non-strings as-is
        o.getValueString = function getValueString(value) {
            var valueString = "" + value;
            if (typeof(value) === "string") {
                var quote = "(?:\\" + "'" + "{0,1}|\\" + '"' + "{0,1}){0,1}"
                valueString = quote + value + quote;
            }
            return valueString;
        }
        // (Needs work) Checks code to see if the student used a single 
        // statement to initialize all of the variables in varNames to the
        // values in values. If values is unspecified, just looks for 
        // declarations. If values is specified, it must be an array the same
        // size as varNames, and each value in values corresponds to the
        // variable name in varNames. The regex should then check code to see
        // that some form of 
        // var varNames[a]=values[a],varNames[b]=values[b]...varNames[n]=values[n];
        // where the indices can be in any order but form the entire set of integers
        // between 0 and varNames.length - 1
        o.checkForMultiDeclaration = function checkForMultiDeclaration(code, msg, varNames, values) {
            if (varNames === undefined || varNames.length === 0 ||
                (values && values.length &&
                values.length !== varNames.length)) {
                console.log("Error - varNames: `" + varNames + "`; values: `" + values + "`.");
                return false;
            }
            
            var whiteSpace = "(?:\\s|\\n|\\f|\\r)";
            var varName = "([0-9A-Za-z\\_]+)";
            var valueString = "(\\w+)";
            var parserStr = "var" + whiteSpace + "+";
            var names = "";
            for (var i=0, max=varNames.length; i<max; i++) {
                if (names.length > 0) {
                    names += whiteSpace + "*," + whiteSpace + "*";
                }
                names += varName;
                if (values && values.length) {
                    names += whiteSpace + "*=" + whiteSpace + "*" + o.getValueString(valueString);
                }
            }
            parserStr += names + whiteSpace + "*;";
            var parser = new RegExp(parserStr,"gm");
            var matches = parser.exec(code);
            var matchResults = [];
            if (matches && matches.length > 0) {
                for (i=1, max=matches.length; i<max; i++) {
                    if (matches[i] !== "'" &&  matches[i] !== '"') {
                        matchResults.push(matches[i]);
                    }
                }
            }
            matches = matchResults;
            var result = false;
            if (matches && matches.length > 0) {
                result = true;
                var foundIndices = [];
                for (i=0, max=varNames.length; i<max; i++) {
                    var varIdx = i*2, valIdx = varIdx+1;
                    if (matches.length > varIdx) {
                        var foundIdx = varNames.indexOf(matches[varIdx]);
                        if (foundIdx < 0 ||
                            foundIndices.indexOf(foundIdx) !== -1 ||
                            (values !== undefined &&
                            "" + values[foundIdx] !== "" + matches[valIdx])) {
                                result = false;
                                console.log("Mismatch - foundIdx: " + foundIdx + 
                                "; foundIndices: `" + foundIndices + 
                                "`; matches[varIdx]: `" + matches[varIdx] + 
                                "`; matches[valIdx]: `" + matches[valIdx] + 
                                "`");
                                break;
                        }
                        foundIndices.push(foundIdx);
                    }
                }
            }
            if (!result) {
                console.log(msg);
            }
            return result;
        };

        // Add all functions to this
        (function () {
            for (var func in o) {
                that[func] = o[func];
            }
        })();
        
        // Check if all functions in o are in this
        if (!(function () {
            var returnVal = true;
            for (var func in o)
            {
                if (!o.isDefinedAndAFunction(that, func))
                {
                    returnVal = false;
                    console.log(that.isDefinedAndAFunction(that, func));
                }
            }
            return returnVal;
        })())
        {
            // List the function names in this
            (function () {
                for (var func in that) {
                    console.log(func + ": " + that[func].name + " (" + typeof(that[func]) + ")");
                }
            })();
        }
    })(returnVal);
    
    if (submissionTestUtils.runTests === undefined) {
        submissionTestUtils.runTests = function() {
            var sIGNORE = "[IGNORE] ***************** [IGNORE] ";
            var testUtils = submissionTestUtils(null);
            var CC = testUtils.getCC();
            
            // Test that swapWrap works as expected
            (function test_swapWrap(util) {
                var o = {
                    x:  function foo() {
                            console.log("ERROR: This should not be displayed to the console.");
                        }
                    };
                util.swapWrap(o, "foo", 
                    function () {
                        return;
                    },
                    function () {
                        o.x();
                    });
            })(testUtils);
            // Test that logWrap works as expected
            (function test_logWrap(util) {
                function triesToWriteToConsole(s) {
                    console.log(s);
                }
                util.logWrap(function (logger) {
                    var shouldNOTAppearInConsole = "But this shouldn't be!";
                    logger.log(sIGNORE + "This should be printed to the console");
                    triesToWriteToConsole(shouldNOTAppearInConsole);
                    if (logger.entries[0] != shouldNOTAppearInConsole) {
                        logger.log("consoleWrap not capturing console logs!");
                    }
                });
            })(testUtils);
            // Test that isDefined works as expected
            (function test_isDefined(util) {
                util.logWrap(function(console) {
                    var o = {
                        x: 1
                    };
                    if (!util.isDefined(o, "x")) {
                        console.log("isDefined: x should be defined but isn't.");
                    }
                    if (util.isDefined(o, "y")) {
                        console.log("isDefined: y is defined but shouldn't be.");
                    }
                });
            })(testUtils);
            // Test that isAFunction works as expected
            (function test_isAFunction(util) {
                util.logWrap(function(logger) {
                    var o = {
                        x: function () { },
                        y: 1
                    };
                    if (!util.isAFunction(o, "x")) {
                        logger.log("isAFunction: x should be a function but isn't.");
                    }
                    if (util.isAFunction(o, "y")) {
                        logger.log("isAFunction: y is a function but shouldn't be.");
                    }
                });
            })(testUtils);
            // Test that isDefinedAndAFunction works as expected
            (function test_isDefinedAndAFunction(util) {
                util.logWrap(function(logger) {
                    var o = {
                        x: function () { },
                        y: 1
                    };
                    if (util.isDefinedAndAFunction(o, "w")) {
                        logger.log("isDefinedAndAFunction: w is defined and a function but shouldn't be.");
                    }
                    if (!util.isDefinedAndAFunction(o, "x")) {
                        logger.log("isDefinedAndAFunction: x should be a function but isn't.");
                    }
                    if (util.isDefinedAndAFunction(o, "y")) {
                        logger.log("isDefinedAndAFunction: y is a function but shouldn't be.");
                    }
                });
            })(testUtils);
            // Test that funcIsCalledWithArgs works as expected
            (function test_funcIsCalledWithArgs(util) {
                util.logWrap(function(logger) {
                    CC.addCall("foo", [[]]);
                    if (!util.funcIsCalledWithArgs("foo", [[]])) {
                        logger.log("funcIsCalledWithArgs: foo is not called with expected args and should be.");
                    }
                    if (util.funcIsCalledWithArgs("bar", [[]])) {
                        logger.log("funcIsCalledWithArgs: bar is called with args and shouldn't be.");
                    }
                });
            })(testUtils);
            // Test that funcCallsTarget works as expected
            (function test_funcCallsTarget(util) {
                util.logWrap(function(logger) {
                    var o = {
                        x: function(f) { f(); },
                        y: function() { },
                        z: function() { }
                    };
                    if (!util.funcCallsTarget(o, "x", "z")) {
                        logger.log("funcCallsTarget: x should call z but doesn't.");
                    }
                    if (util.funcCallsTarget(o, "y", "z")) {
                        logger.log("funcCallsTarget: y should not call z but does.");
                    }
                });
            })(testUtils);
            // Test that assertAreEqual works as expected
            (function test_assertAreEqual(util) {
                util.logWrap(function(logger) {
                    var x = 1, y = 2, z = 1;
                    if (!util.assertAreEqual(x, x)) {
                        logger.log("assertAreEqual: should be true for (x, x).");
                    }
                    if (!util.assertAreEqual(x, z)) {
                        logger.log("assertAreEqual: should be true for (x, z).");
                    }
                    if (util.assertAreEqual(x, y)) {
                        logger.log("assertAreEqual: should be false for (x, y).");
                    }
                });
            })(testUtils);
            // Test that assertAreNotEqual works as expected
            (function test_assertAreNotEqual(util) {
                util.logWrap(function(logger) {
                    var x = 1, y = 2, z = 1;
                    if (util.assertAreNotEqual(x, x)) {
                        logger.log("assertAreNotEqual: should be false for (x, x).");
                    }
                    if (util.assertAreNotEqual(x, z)) {
                        logger.log("assertAreNotEqual: should be false for (x, z).");
                    }
                    if (!util.assertAreNotEqual(x, y)) {
                        logger.log("assertAreNotEqual: should be true for (x, y).");
                    }
                });
            })(testUtils);
            // Test that errorOccurred works as expected
            (function test_errorOccurred(util) {
                util.logWrap(function(logger) {
                    var error = new Error(),
                        nullError = null,
                        allow = true;
                    if (util.errorOccurred(nullError, allow)) {
                        logger.log("errorOccurred: should be false when no error and allow.");
                    }
                    if (util.errorOccurred(nullError, !allow)) {
                        logger.log("errorOccurred: should be false when no error and !allow.");
                    }
                    if (!util.errorOccurred(error, allow)) {
                        logger.log("errorOccurred: should be true when error and allow.");
                    }
                    if (util.errorOccurred(error, !allow)) {
                        logger.log("errorOccurred: should be false when error and !allow.");
                    }
                });
            })(testUtils);
            // Test that swapScopeFunction works as expected
            (function test_swapScopeFunction(util) {
                util.logWrap(function(logger) {
                    var o = {
                        x: function() { return false; },
                        y: function() { return true; }
                    };
                    util.swapScopeFunction(o, "x", o.y, true);
                    if (!o.x()) {
                        logger.log("swapScopeFunction: o.x() should be true");
                    }
                });
            })(testUtils);
            // Test that func1CallsFunc2WithArgs works as expected
            (function test_func1CallsFunc2WithArgs(util) {
                util.logWrap(function(logger) {
                    var o = {
                        x: function() { o.z(); },
                        y: function() { },
                        z: function() { }
                    };
                    var testFunc = function() { return true; };

                    if (!util.func1CallsFunc2WithArgs(o, "x", "z", testFunc)) {
                        logger.log("func1CallsFunc2WithArgs: should be true");
                    }
                    if (util.func1CallsFunc2WithArgs(o, "y", "z", testFunc)) {
                        logger.log("func1CallsFunc2WithArgs: should be false");
                    }
                });
            })(testUtils);
            
            // Need a function that takes a scope and 
            
            console.log(sIGNORE + "Test complete");
        };
    }
    return returnVal;
}

