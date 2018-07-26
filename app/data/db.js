/**
 * db modulie for writing and reading the global state in akiee
 * @module data/db
 */


/***********
 * Exports *
 ***********/

exports.tasks = tasks;


/******************
 * Module imports *
 ******************/

const atom = require("js-atom");
const _ = require("underscore");
const node = require("./node.js");
const {hasString, checkExpect, thread} = require("./helpers.js");


/*************
 * Constants *
 *************/

const {TODO, DOING, DONE, ALL} = require("./constants.js");


/*********
 * State *
 *********/

// const $confState$ = atom.createAtom({taskLocation: ""})  TODO: Needs to be configured

const $appState$ = atom.createAtom({
    isEditor: false, 
    isSearch: false, 
    isEntry: false,
    isChanged: false,
    searchString: "",
    isSelected: null,
    isEditable: null,
    listState: DOING
});

const $taskList$ = atom.createAtom(
    node.lonFromFile()
);


/*************
 * Functions *
 *************/

/**
 * Consume a Task-Location directory and produces a new GlobalState with new tasks
 * @param {string} pth - a path to the tasklist file
 * @returns {ListOfNode}
 */
function resetTasklist(pth) {
    return $taskList$.reset(node.lonFromFile); // TODO: use the path to load the file
}

/**
 * returns the nodes of the app-state
 * @returns {ListOfNode}
 */
function nodes() {
    return $taskList$.deref();
}

/**
 * returns the state of the task entry
 * @returns {boolean}
 */
function isEntry() {
    return $appState$.deref().isEntry;
}

/**
 * @returns {boolean}
 */
function isChanged() {
    return $appState$.deref().isChanged;
}

/**
 * @returns {ListState}
 */
function listState() {
    return $appState$.deref().listState;
}


/**
 * returns the state of the selected node
 * @return {string}
 */
function selected() {
    return $appState$.deref().selected;
}

/**
 * returns the state of the editable filed
 * @returns {string}
 */
function editable() {
    return $appState$.deref().editable;
}

// Start tasks and helper function
/**
 * Produces the list of task to show, for the current state.
 * @returns {ListOfNode}
 */
function tasks() {
    return tasksHelper($appState$.deref().searchString, $appState$.deref().listState);
}

/**
 * Consumes the search string and the state of the list and produces
 * the tasks to show.
 * @param {string} ss - the search string
 * @param {ListState} ls
 * @return {ListOfNode} - the tasks to show t.level === 2
 */
function tasksHelper(ss, ls) {    
    return thread("->", $taskList$.deref(),
            [_.filter, filterTasks],
            [_.filter, x => filterState(x, ls)],
            [_.filter, x => filterSearch(x, ss)],
            max100); 
}

/**
 * Decides if a Node is a Task
 * @param {Node} x 
 */
function filterTasks(x) {
    return (x.level === 2) ? true : false;
}

/**
 * Decides if the a Node are part of a certain ListState
 * @param {Node} x - the node to filter
 * @param {ListState} ls 
 */
function filterState(x, ls) {
    switch (ls) {
        case ALL:
            return true;

        case x.todo:
            return true;
    
        default:
            return false;
    }
}
checkExpect(filterState({todo: DOING}, ALL), true);
checkExpect(filterState({todo: DOING}, DOING), true);
checkExpect(filterState({todo: DOING}, TODO), false);

/**
 * Decides if a Node contains a searchstring 
 * @param {Node} x
 * @param {string} ss - the search string
 * @returns true
 */
function filterSearch(x, ss) {
    if (_.isEmpty(ss)) {
        return true;
    } else {
        if ((hasString(x.headline, ss)) 
            || (hasString(node.tagsString(x), ss))
            || (hasString(x.project, ss))) {
            return true;
        } else {
            return false;
        }
    }
}
checkExpect(filterSearch({headline: "foo", tags: "a:bar:c", project: "baz"}, "foo"), true);
checkExpect(filterSearch({headline: "bar", tags: "a:bar:c", project: "baz"}, "bar"), true);
checkExpect(filterSearch({headline: "foo", tags: "a:bar:c", project: "baz"}, "baz"), true);
checkExpect(filterSearch({headline: "foo", tags: "a:bar:c", project: "baz"}, "qux"), false);


/**
 * Bounds a ListOfNode to a max of 100 entrys
 * @param {ListOfNode} lon 
 * @returns {ListOfNode}
 */
function max100(lon) {
    return (lon.length > 100) ? lon.slice (0, 100) : lon;
}

/**
 * Sorts a ListOfNode accordingly to it's ListState by Rank or descending by Date
 * @param {ListOfNode} lon 
 * @param {ListState} ls 
 * @returns {ListOfNode}
 */
function sortTasks(lon, ls) {
    const toSort = [...lon];
    if (ls === DONE) {
        return toSort.sort((a,b) => (node.isNewerDate(a.fin, b.fin)) ? -1 : 1);
    } else {
        return toSort.sort((a,b) => a.rank - b.rank);
    }
}
const lon = [{rank: 4, fin: "<2018-8-28>"},
             {rank: 1, fin: "<2015-5-11>"},
             {rank: 7, fin: "<2016-5-14>"}];
checkExpect(sortTasks(lon, TODO),
            [{rank: 1, fin: "<2015-5-11>"},
             {rank: 4, fin: "<2018-8-28>"},
             {rank: 7, fin: "<2016-5-14>"}],
            "sortTasks() with rank")
checkExpect(sortTasks(lon, DONE),
            [{rank: 4, fin: "<2018-8-28>"},
             {rank: 7, fin: "<2016-5-14>"},
             {rank: 1, fin: "<2015-5-11>"}],
            "sortTasks() with date");
// End tasks and helper functions