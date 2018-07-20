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
function checkExpect (obj1, obj2) {
    if ($debug$) {
        if (!_.isEqual(obj1, obj2)) {
            console.log("\nDIDN'T CHECK:");
            console.dir(obj1);
            console.log("is not equal to");
            console.dir(obj2);
            console.dir();
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
