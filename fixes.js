// There is a bug on CC (already reported) where Math.random() always returns
// the same random numbers. The randomize function acts as a seed - it gets
// a random-ish value by taking the 2 least significant digits of the current
// time, and calls Math.Random the resulting number of times.

// Calls Math.random a few times to initialize it
(function randomize() {
    var secs = Date.now();
    var s = "" + secs;
    s = s.slice(-2);
    for (var i=0; i<s; i++) {
        Math.random();
    }
})();