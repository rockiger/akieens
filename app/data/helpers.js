/**
 * Function helpers
 * @module data/helpers
 */


/***********
 * Exports *
 ***********/

exports.checkExpect = checkExpect;
exports.notEmpty = notEmpty;
exports.hasString = hasString;
exports.thread = thread;


/******************
 * Module imports *
 ******************/

const _ = require("underscore");


/*************
 * Constants *
 *************/

const DEBUG = true;


/*************
 * Functions *
 *************/

/**
 * Compares if two objects are equal and prints an error message if not.
 * @param {obj1}
 * @param {obj2}
 */
function checkExpect (obj1, obj2, msg='') {
    if (DEBUG) {
        if (!_.isEqual(obj1, obj2)) {
            const error = new Error();
            //console.dir("caller is " + checkExpect.caller);
            console.log("==============================")
            console.log("Test:", msg, "failed.")
            console.log(obj1)
            console.log("is not equal to")
            console.log(obj2);
            console.log("called from:", _.last(error.stack.split("\n")[2].split("/")).slice(0, -1));
            console.log("==============================")
        }
    }
}


function notEmpty(list) {
    return !_.isEmpty(list);
}
checkExpect(notEmpty([]), false);
checkExpect(notEmpty([1]), true);

/**
 * Determins if a string contains a substring
 * @param {string} str - the string to be searched
 * @param {string} ss - the search string
 */
function hasString(str, ss) {
    const result = str.search(new RegExp(ss, "i"));
    return (result !== -1) ? true : false;
}
checkExpect(hasString("Test", "t"), true);
checkExpect(hasString("Test", "T"), true);
checkExpect(hasString("Test", "o"), false);


/**
 * Thread function in a more readable way, similar to the clojure threading macros
 * Read more at:
 *      https://clojuredocs.org/clojure.core/->
 *      https://clojuredocs.org/clojure.core/->>
 * @param {string} operator - the threading operator, -> or ->>
 * @param {*} first 
 * @param {function|Array} args - one ore more function(s) and/or Arrays
 * @returns {*} - the result of the computation
 * thread("->", "3",
 *  fn1,
 *  [fn2, val],
 *  fn3) 
 */
function thread(operator, first, ...args) {
    let isThreadFirst;
    switch (operator) {
        case '->>':
            isThreadFirst = false;
            break
        case '->':
            isThreadFirst = true;
            break;
        default:
            throw new Error('Operator not supported');
            break;
    }
    return args.reduce((prev, next) => {
        if (Array.isArray(next)) {
            const [head, ...tail] = next;
            return isThreadFirst ? head.apply(this, [prev, ...tail]) : head.apply(this, tail.concat(prev));
        }
        else {
            return next.call(this, prev);
        }
    }, first);
}
checkExpect(thread("->", "3",
                parseInt),
            3);