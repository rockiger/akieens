/**
 * db modulie for writing and reading the global state in akiee
 * @module data/db
 */


/**
 * Module imports
 */

const node = require("./node.js");

/**
 * Constants
 */

const {TODO, DOING, DONE, ALL} = require("./constants.js");




function tasks (ls="DOING") {
    return tasksHelper(ls);

    function tasksHelper(ls) {
        return node.lonFromFile();
    }
}


exports.tasks = tasks;