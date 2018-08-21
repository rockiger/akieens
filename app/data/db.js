/**
 * db modulie for writing and reading the global state in akiee
 * @module data/db
 */


/***********
 * Exports *
 ***********/

exports.tasks = tasks;
exports.noOfTasks = noOfTasks;
exports.observeAppState = observeAppState;
exports.unobserveAppState = unobserveAppState;
exports.switchListState = switchListState;
exports.listState = listState;
exports.setNextTaskState = setNextTaskState;
exports.setPrevTaskState = setPrevTaskState;
exports.observeTaskList = observeTaskList;
exports.unobserveTaskList = unobserveTaskList;


/******************
 * Module imports *
 ******************/

const fs = require("tns-core-modules/file-system");
const atom = require("js-atom");
const _ = require("underscore");
const node = require("./node.js");
const {hasString, checkExpect, thread} = require("./helpers.js");


/*************
 * Constants *
 *************/

const {TODO, DOING, DONE, ALL, FOLDER, FILENAME} = require("./constants.js");
const NEXT_STATE = Object.freeze({TODO: DOING, DOING: DONE, DONE: TODO});
const PREV_STATE = Object.freeze({TODO: DONE, DOING: TODO, DONE: DOING});


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
    node.lonFromFile(fs.path.join(taskLocation(), FILENAME))
);


/*************
 * Functions *
 *************/

/**
 * Adds a function that will be called whenever the AppState changes. 
 * The callback is called with four arguments whenever the state changes.
 * @param {string} key - the key is just a string identifying this observer (needed for unobserving)
 * @param {function} fn - the function is called with four arguments whenever the state changes e.g. function ("watch", (key, ref, old, nw) => {}):
 *  - key - the key used to register the watcher
 *  - ref - the reference to the state
 *  - old - the previous value
 *  - nw - the new value
 */
function observeAppState(key, fn) {
    $appState$.addWatch(key, fn);
}

/**
 * Adds a function that will be called whenever the taskList changes. 
 * The callback is called with four arguments whenever the state changes.
 * @param {string} key - the key is just a string identifying this observer (needed for unobserving)
 * @param {function} fn - the function is called with four arguments whenever the state changes e.g. function ("watch", (key, ref, old, nw) => {}):
 *  - key - the key used to register the watcher
 *  - ref - the reference to the state
 *  - old - the previous value
 *  - nw - the new value
 */
function observeTaskList(key, fn) {
    $taskList$.addWatch(key, fn);
}

/**
 * Removes the previously added watcher from the AppState.
 * @param {string} key - the previously added watcher
 */
function unobserveAppState(key) {
    $appState$.removeWatch(key);
}

/**
 * Removes the previously added watcher from the taskList.
 * @param {string} key - the previously added watcher
 */
function unobserveTaskList(key) {
    $taskList$.removeWatch(key);
}

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
    return tasksHelper($appState$.deref().searchString, 
                       $appState$.deref().listState,
                       $taskList$.deref());
}

/**
 * Consumes the search string, state of the list and the list
 * and produces the tasks to show.
 * @param {string} ss - the search string
 * @param {ListState} ls - the list state
 * @param {ListOfNode} lon - the list of tasks
 * @return {ListOfNode} - the tasks to show t.level === 2
 */
function tasksHelper(ss, ls, tasklist) {    
    return thread("->", tasklist,
            [_.filter, filterTasks],
            [_.filter, x => filterState(x, ls)],
            [_.filter, x => filterSearch(x, ss)],
            max100); 
}
const _lon = [{level: 2, todo: TODO, headline: "foo", tags: {a: true, bar: true, c: true}, 
               project: "baz", rank: 4, fin: "<2018-8-28>"},
              {level: 2, todo: DOING, headline: "fooo", tags: {a: true, barr: true, c: true}, 
               project: "bazz", rank: 1, fin: "<2018-8-29>"},
              {level: 2, todo: TODO, headline: "foooo", tags: {a: true, barrr: true, c: true}, 
               project: "bazzz", rank: 3, fin: "<2018-8-30>"},
              {level: 1, todo: null, headline: "bazzz", tags: {}, fin: null}]
checkExpect(tasksHelper("", DOING, _lon), 
            [{level: 2, todo: DOING, headline: "fooo", tags: {a: true, barr: true, c: true}, 
              project: "bazz", rank: 1, fin: "<2018-8-29>"}])
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
checkExpect(filterSearch({headline: "foo", tags: {a: true, bar: true, c: true}, project: "baz"}, "foo"), true);
checkExpect(filterSearch({headline: "bar", tags: {a: true, bar: true, c: true}, project: "baz"}, "bar"), true);
checkExpect(filterSearch({headline: "foo", tags: {a: true, bar: true, c: true}, project: "baz"}, "baz"), true);
checkExpect(filterSearch({headline: "foo", tags: {a: true, bar: true, c: true}, project: "baz"}, "qux"), false);


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
const _lon1 = [{rank: 4, fin: "<2018-8-28>"},
             {rank: 1, fin: "<2015-5-11>"},
             {rank: 7, fin: "<2016-5-14>"}];
checkExpect(sortTasks(_lon1, TODO),
            [{rank: 1, fin: "<2015-5-11>"},
             {rank: 4, fin: "<2018-8-28>"},
             {rank: 7, fin: "<2016-5-14>"}],
            "sortTasks() with rank")
checkExpect(sortTasks(_lon1, DONE),
            [{rank: 4, fin: "<2018-8-28>"},
             {rank: 7, fin: "<2016-5-14>"},
             {rank: 1, fin: "<2015-5-11>"}],
            "sortTasks() with date");
// End tasks and helper functions

/**
 * Produces an object with the number of the corresponding task states
 * @return {object}
 */
function noOfTasks() {
    const tasks = $taskList$.deref();
    return {
        ALL: noOfTasksHelper(ALL, tasks),
        TODO: noOfTasksHelper(TODO, tasks),
        DOING: noOfTasksHelper(DOING, tasks),
        DONE: noOfTasksHelper(DONE, tasks)
    }
}

/**
 * Counts the task with a certain state in a given ListOfNode
 * @param {ListState} ls 
 * @param {ListOfNode} lon
 * @returns {number}
 */
function noOfTasksHelper(lon, ls) {
    const ft = _.filter(lon, filterTasks);
    const fs = _.filter(ft, x => filterState(x, ls));
    return fs.length;
}            
checkExpect(noOfTasksHelper(_lon, ALL), 3);
checkExpect(noOfTasksHelper(_lon, TODO), 2);
checkExpect(noOfTasksHelper([], TODO), 0);


/**
 * Produces the sorted list of projects
 * @returns {Array<string>} - the list of projects
 */
function projects() {
    return projectsHelper($taskList$.deref());
}

/**
 * Produces a list of projects in a ListOfNode
 * @param {ListOfNode} lon 
 * @returns {Array<string>}
 */
function projectsHelper(lon) {
    //console.log(lon);
    const projects = _.filter(lon, x => (x.level === 1) ? true : false);
    const projectNames = projects.map(x => x.headline);
    return projectNames.sort();
}
const _lon2 = [{level: 1, todo: null, headline: "foo", tags: {}, fin: null},
               {level: 2, todo: TODO, headline: "foo", tags: {a: true, bar: true, c: true}, 
                project: "baz", rank: 4, fin: "<2018-8-28>"},
               {level: 2, todo: DOING, headline: "fooo", tags: {a: true, barr: true, c: true}, 
                project: "bazz", rank: 1, fin: "<2018-8-29>"},
               {level: 1, todo: null, headline: "bazzz", tags: {}, fin: null},
               {level: 2, todo: TODO, headline: "foooo", tags: {a: true, barrr: true, c: true}, 
                project: "bazzz", rank: 3, fin: "<2018-8-30>"},
               {level: 1, todo: null, headline: "bar", tags: {}, fin: null}]
checkExpect(projectsHelper(_lon2), ["bar", "bazzz", "foo"]);


/**
 * Returns the path to the folder where the task files are stored
 */
function taskLocation() {
    const folder = fs.knownFolders.currentApp()
    const fpath = fs.path.join(folder.path, FOLDER);
    return fpath;
}

/**
 * Returns the position of the first of occurence of a node with key ky in ListOfNode lon
 * @param {String} ky 
 * @param {ListOfNode} lon 
 */
function nodePosByKey(ky, lon) {
    for (let n = 0; n < lon.length; n++) {
        const element = lon[n];
        if (element.key === ky) {
            return n;
        }
    }
    return -1
}
checkExpect(nodePosByKey("euritna", [{key: "node_1"}, {key: "node_2"}, {key: "orgnode_33.##"}]), -1)
checkExpect(nodePosByKey("node_1", [{key: "node_1"}, {key: "node_2"}, {key: "orgnode_33.##"}]), 0)
checkExpect(nodePosByKey("node_2", [{key: "node_1"}, {key: "node_2"}, {key: "orgnode_33.##"}]), 1)
checkExpect(nodePosByKey("orgnode_33.##", [{key: "node_1"}, {key: "node_2"}, {key: "orgnode_33.##"}]), 2)
// TODO tests

// TODO Functions that change the state

/**
 * Consumes a Liststate and changes the AppState accordingly.
 * @param {ListState} ls 
 */
function switchListState(ls) {
    const old = $appState$.deref();
    const nw = {
        ...old,
        listState: ls
    };
    $appState$.reset(nw);
}

/**
 * Consumes a key and changes the task-state to the next state of given task in $taskList$
 * @param {TaskState} ky 
 * @return lon - the new
 */
function setNextTaskState(ky) {
    return setTaskState(ky, NEXT_STATE);
}


/**
 * Consumes a key and changes the task-state to the previos state of given task in $taskList$
 * @param {TaskState} ky 
 * @return lon - the new
 */
function setPrevTaskState(ky) {
    return setTaskState(ky, PREV_STATE);
}


/**
 * Consumes a key and changes the task-state to the new state of given task in $taskList$
 * according to newStates
 * @param {TaskState} ky 
 * @param {object} newStates - dictionary to choose the right new state, e.g. NEXT_STATE
 * @return lon - the new
 */
function setTaskState(ky, newStates) {
    const lon = nodes(),
          pos = nodePosByKey(ky, lon), //!!
          nd = lon[pos],
          oldTs = nd["todo"],
          newTs = newStates[oldTs];

    nd["todo"] = newTs;
    lon[pos] = nd;

    reset($taskList$, lon);

    return lon;
}

function reset(atom, lon) {
    // TODO freeze object
    atom.reset(lon);
    // todo write atom to file
    return lon
}