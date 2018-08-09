/* code-behind file for main-page.xml */


/******************
 * Module imports *
 ******************/

const view = require("tns-core-modules/ui/core/view");
const utils = require("tns-core-modules/utils/utils");
const atom = require("js-atom");
const mainViewModel = require("./main-view-model");
const db = require("./data/db.js");


console.log(utils)
/*************
 * Constants *
 *************/

const {TODO, DOING, DONE} = require("./data/constants.js");
const TOOLBARINDEX = {TODO: 0, DOING: 1, DONE: 2};


/*********
 * State *
 *********/

const $leftThresholdPassed$ = atom.createAtom(false, {validator: b => typeof(b) === "boolean"});
const $rightTresholdPassed$ = atom.createAtom(false, {validator: b => typeof(b) === "boolean"});


/*************
 * Functions *
 *************/

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

/* Callback when the AppState changes */
function updateMainPage(key, ref, old, nw, page) {
    const tasks = page.getViewById("tasks");
    const toolbar = page.getViewById("toolbar");

    tasks.items = db.tasks();
    toolbar.selectedIndex = TOOLBARINDEX[db.listState()];
}


/* Functions to handle swiping of tasks */

function onSwipeCellStarted(args) {
    const swipeView = args.swipeView;
    const swipeLimits = args.data.swipeLimits;
    const mainView = args.mainView;
    const leftItem = swipeView.getViewById('left');
    const rightItem = swipeView.getViewById('right');
    swipeLimits.left = swipeLimits.right = mainView.getMeasuredWidth();
    swipeLimits.threshold = swipeView.getMeasuredWidth();
}

function onSwipeCellProgressChanged(args) {
    const swipeLimits = args.data.swipeLimits;
    const swipeView = args.swipeView;
    const mainView = args.mainView;
    const leftItem = swipeView.getViewById('left');
    const rightItem = swipeView.getViewById('right');

    if (args.data.x > swipeView.getMeasuredWidth() / 2 && !$leftThresholdPassed$.deref()) {
        console.log("Notify porform left action");
        const leftLabel = leftItem.getViewById('left-label');
        $leftThresholdPassed$.reset(true);
    } else if (args.data.x < -swipeView.getMeasuredWidth() / 2 && !$rightTresholdPassed$.deref()) {
        console.log("Notify perform right action");
        const rightLabel = rightItem.getViewById("right-label");
        $rightTresholdPassed$.reset(true);
    } /* else if (args.data.x < swipeView.getMeasuredWidth() / 2 && $leftThresholdPassed$.deref()) {
        console.log("Unnotify porform left action");
        const leftLabel = leftItem.getViewById('left-label');
        $leftThresholdPassed$.reset(false);
    } else if (args.data.x > -swipeView.getMeasuredWidth() / 2 && $rightTresholdPassed$.deref()) {
        console.log("Unnotify perform right action");
        const rightLabel = rightItem.getViewById("right-label");
        $rightTresholdPassed$.reset(false);
    } */

    if (args.data.x > 0) {
        const leftDimensions = view.View.measureChild(
            leftItem.parent,
            leftItem,
            utils.layout.makeMeasureSpec(Math.abs(args.data.x), utils.layout.EXACTLY),
            utils.layout.makeMeasureSpec(mainView.getMeasuredHeight(), utils.layout.EXACTLY)
        );
        view.View.layoutChild(
            leftItem.parent,
            leftItem,
            0,
            0,
            leftDimensions.measuredWidth,
            leftDimensions.measuredHeight
        );
    } else {
        const rightDimensions = view.View.measureChild(
            rightItem.parent,
            rightItem,
            utils.layout.makeMeasureSpec(Math.abs(args.data.x), utils.layout.EXACTLY),
            utils.layout.makeMeasureSpec(mainView.getMeasuredHeight(), utils.layout.EXACTLY)
        );
        view.View.layoutChild(
            rightItem.parent, 
            rightItem,
            mainView.getMeasuredWidth() - rightDimensions.measuredWidth, 
            0,
            mainView.getMeasuredWidth(),
            rightDimensions.measuredHeight
        );
    }
}

function onSwipeCellFinished (args) {

    console.log("onSwipeCellFinished")
    const swipeView = args.swipeView;
    const leftItem = swipeView.getViewById('left');
    const rightItem = swipeView.getViewById('right');

    if ($leftThresholdPassed$.deref()) {
        console.log("Perform left action");
    } else if ($rightTresholdPassed$.deref()) {
        console.log("Perform rigt action");
    }

    $leftThresholdPassed$.reset(false);
    $rightTresholdPassed$.reset(false);
}

/*
Exporting a function in a NativeScript code-behind file makes it accessible
to the file’s corresponding XML file. In this case, exporting the onNavigatingTo
function here makes the navigatingTo="onNavigatingTo" binding in this page’s XML
file work.
*/
exports.onNavigatingTo = onNavigatingTo;
exports.onNavigatingFrom = onNavigatingFrom;
exports.onSwipeCellStarted = onSwipeCellStarted;
exports.onSwipeCellProgressChanged = onSwipeCellProgressChanged;
exports.onSwipeCellFinished = onSwipeCellFinished;