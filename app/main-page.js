/* code-behind file for main-page.xml */


/******************
 * Module imports *
 ******************/

const mainViewModel = require("./main-view-model");
const db = require("./data/db.js");

/*************
 * Constants *
 *************/

const {TODO, DOING, DONE} = require("./data/constants.js");
const TOOLBARINDEX = {TODO: 0, DOING: 1, DONE: 2};

function onNavigatingTo(args) {
    /*
    This gets a reference this page’s <Page> UI component. You can
    view the API reference of the Page to see what’s available at
    https://docs.nativescript.org/api-reference/classes/_ui_page_.page.html
    */
    const page = args.object;
    const toolbar = page.getViewById("toolbar");
    db.observeAppState("main-page", 
        (key, ref, old, nw) => updateMainPage(key, ref, old, nw, page));
    
    db.switchListState(DOING);
    
    toolbar.on("selectedIndexChange", onselectedIndexChange);
}


function onNavigatingFrom(args) {
    db.unobserveAppState("main-page")
}


function onselectedIndexChange(args) {
    const selectedIndex = args.object.selectedIndex;
    switch (selectedIndex) {
        case 0:
            db.switchListState(TODO); 
            break;

        case 1:
            db.switchListState(DOING); 
            break;

        case 2:
            db.switchListState(DONE); 
            break;
    }
}

/* Callback if the AppState changes */
function updateMainPage(key, ref, old, nw, page) {
    const tasks = page.getViewById("tasks");
    const toolbar = page.getViewById("toolbar");

    tasks.items = db.tasks();
    toolbar.selectedIndex = TOOLBARINDEX[db.listState()];
}

/*
Exporting a function in a NativeScript code-behind file makes it accessible
to the file’s corresponding XML file. In this case, exporting the onNavigatingTo
function here makes the navigatingTo="onNavigatingTo" binding in this page’s XML
file work.
*/
exports.onNavigatingTo = onNavigatingTo;
exports.onNavigatingFrom = onNavigatingFrom;