const Observable = require("data/observable").Observable;

// TODO: js-atom vs Observable 
// const atom = require("js-atom");

const db = require("./data/db.js");

/**
 * Constants
 */

const {TODO, DOING, DONE, ALL} = require("./data/constants.js");


/**
 * Functions
 */

function getMessage(counter) {
    if (counter <= 0) {
        return "Hoorraaay! You unlocked the NativeScript clicker achievement!";
    } else {
        return counter + " taps left";
    }
}

function createViewModel() {
    var viewModel = new Observable();
    viewModel.counter = 42;
    viewModel.message = getMessage(viewModel.counter);
    viewModel.tasklist = db.tasks();

    viewModel.onTap = function() {
        this.counter--;
        this.set("message", getMessage(this.counter));
    }
    return viewModel;
}

exports.createViewModel = createViewModel;