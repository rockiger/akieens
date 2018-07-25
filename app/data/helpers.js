/**
 * Function helpers
 * @module data/helpers
 */


/******************
 * Module imports *
 ******************/

const _ = require("underscore");


/*************
 * Constants *
 *************/

const $debug$ = true;


/*************
 * Functions *
 *************/

/**
 * Compares if two objects are equal and prints an error message if not.
 * @param {obj1}
 * @param {obj2}
 */
function checkExpect (obj1, obj2, msg='') {
    if ($debug$) {
        if (!_.isEqual(obj1, obj2)) {
            const error = new Error();
            //console.dir("caller is " + checkExpect.caller);
            console.log("==============================")
            console.log("Test:", msg, "failed.")
            console.dir(obj1, "is not equal to", obj2);
            console.log("called from:", _.last(error.stack.split("\n")[1].split("/")).slice(0, -1));
            console.log("==============================")
        }
    }
}
exports.checkExpect = checkExpect;


function notEmpty(list) {
    return !_.isEmpty(list);
}
checkExpect(notEmpty([]), false);
checkExpect(notEmpty([1]), true);
exports.notEmpty = notEmpty; 
