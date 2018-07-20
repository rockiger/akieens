/**
 * Data definitions for akiee
 * @module data/datadefinitions
 */


const constants = require("./constants.js");

/**
 * Constants
 */

const TODO = constants.TODO,
      DOING = constants.DOING,
      DONE = constants.DONE,
      ALL = constants.ALL;

/**
 * TaskState is one of:
 * - "TODO"
 * - "DOING"
 * - "DONE"
 * @type {string}
 * interp. as the current state of a task
 */
function fnForTaskState (ts) {
    switch (ts) {
        case TODO:            
            break;
        
        case DOING:
            break;

        case DONE:
            break;
    }
}


/**
 * RepeatInfo consists of:
 * {rate: 1, unit: "daily"}
 * - rate: Integer how many units until the next repetition
 * - unit: String with one or more of daily, weekdayly, weekly, monthly, yearly
 * @type {object}
 * interp. as the intervall in which a task gets repeated
 */
const R1 = {rate: 1, unit: "daily"};
function fnForRepeatInfo(r) {
    const rate = r.get(rate),
          unit = r.get(unit);
    switch (unit) {
        case "daily":
            break;
        //...
        case "yearly":
            break;
    }
}


/**
 * Node consists of:
 * - key: unique key in markdown file
 * - level: level in markdown structure
 * - headline
 * - body
 * - tag: default null
 * - tags default []
 * - todo: task state, default null
 * - priority, default null
 * - scheduled, default null
 * - deadline, default null
 * - fin, default null - when task was done
 * - drawer, default {}
 * - rank: unique Ranking in File, default null
 * - rank: string with repeat informatien, default null
 * - style: the NodeStyle of a node TODO: has to be initially 
 *          created in markdown-org-mode; default null
 * - project: The name of the project corresponding project that 
 *            is one level higher, has to found out via a function
 * @type {object}
 */
const N1 = {
    key: "orgode_33.##",
    level: 2,
    headline: "As a user I want to change the state of a task with a simple action.",
    body: "",
    tag: null,
    tags: {},
    todo: "DOING",
    priority: null,
    scheduled: null,
    deadline: null,
    fin: null,
    properties: {},
    drawer: {},
    rank: null,
    repeat: null,
    style: null,
    project: "Inbox"
};
const N1a = {
    key: "orgode_45.##",
    level: 2,
    headline: "As a user I want to change the state of a task with a simple action.",
    body: "",
    tag: null,
    tags: {},
    todo: "DOING",
    priority: null,
    scheduled: null,
    deadline: null,
    fin: null,
    properties: {},
    drawer: {},
    rank: null,
    repeat: null,
    style: null,
    project: "Inbox"
};
const N2 = {
    key: "orgode_83.##",
    level: 2,
    headline: "Make it possible for users to create an account",
    body: "",
    tag: null,
    tags: {},
    todo: "DOING",
    priority: null,
    scheduled: null,
    deadline: null,
    fin: null,
    properties: {},
    drawer: {},
    rank: null,
    repeat: null,
    style: null,
    project: "Inbox"
};
function fnForNode(n) {
    /* ... */ n.get(todo) /* ... */
    /* ... */ n.get(rank) /* ... */
    /* ... */
}
// To make it usable for testing
exports.N1 = N1;
exports.N1a = N1a;
exports.N2 = N2;

/**
 * Rank is one of:
 * - Integer [1, ...]
 * - null || undefined
 * interp. as the ranking of a task
 * should be an int > 0
 * nill equals infinity
 * should be atomar
 */
function fnForRank(r) {
    if (isNull(r)) {
        /* ... */ r
    } else {
        /* ... */ r
    }
}


/**
 * Liststate is one of:
 * - TaskState
 * - "ALL"
 * - false ; don't know if neccessary
 * interp. what is shown in the tasklist
 * ALL means all TaskState tasks are shown combined
 */
function fnForListState (ts) {
    switch (ts) {
        case TODO:            
            break;
        
        case DOING:
            break;

        case DONE:
            break;

        case ALL:
            break;
    }
}


/**
 * NodeStyle is one of:
 * - "TODO"
 * - "DOING"
 * - "DONE"
 * - null
 * @type {string}
 * interp. the styling of a Node
 */
function fnForNodeStyle (ts) {
    switch (ts) {
        case TODO:            
            break;
        
        case DOING:
            break;

        case DONE:
            break;

        default:
            break;
    }
}


/**
 * SwitchState is one of:
 * - true
 * - false
 * interp. if a function is active or NodeStyle
 */
function fnForSwitchState(ss) {
    if (ss) {
        /* ... */ ss;
    } else {
        /* ... */ ss;
    }
}


/**
 * Selected is one of:
 * - string, "orgode_33.##"
 * - null
 * @type {string}
 * interp. the selected Task or nil
 */
const SEL1 = null,
      SEL2 = "orgode_33.##";


/**
 * GlobalState consists of:
 * - SwitchState editor
 * - SwitchState search
 * - SwitchState entry
 * - Bool changed? - if lon changed
 * - the string string in the search box
 * - String or nil Editable - the attribute of the selected task to edit
 * - String or nil Selected - the selected task
 * - ListState
 * - ~~ListOfNode~~ gets it own atom
 * @type {object}
 */
const GS1 = {
    isEditor: false, 
    isSearch: false, 
    isEntry: false,
    isChanged: false,
    searchString: "",
    isSelected: null,
    isEditable: null,
    listState: ""
};


/**
 * ConfState consists of:
 * interp. as the persistant configuration, that can be set by the user-home
 * - TaskLocation "String that holds the path to the directory of liveflow.md"
 * @type {object}
 */
const CS1 = {taskLocation: ""};