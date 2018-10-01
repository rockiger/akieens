/**
 * Functions that change the rank of nodes and produce a new lon
 * @module data/rank
 */

/***********
 * Exports *
 ***********/

exports.moveRank = moveRank;

/******************
 * Module imports *
 ******************/

const _ = require("underscore");
const db = require("./db.js");

/*************
 * Functions *
 *************/

/**
 * Consumes two task and changes the ranks of the two tasks and all
 * task between them.
 * @param {Node} sourceTask 
 * @param {Node} targetTask 
 */
function moveRank(sourceTask, targetTask) {
    let direction = "";
    if (sourceTask.rank > targetTask.rank) {
        direction = "up";
    } else if (sourceTask.rank < targetTask.rank) {
        direction = "down"
    } else {
        return;
    }

    function rankUp (x) {
        if ((x.rank >= targetTask.rank) && 
            (x.rank < sourceTask.rank)) {
                x.rank = x.rank + 1;
        }
        return x
    }

    function rankDown (x) {
        if ((x.rank <= targetTask.rank) &&
            (x.rank > sourceTask.rank)) {
                x.rank = x.rank - 1;
        }
        return x
    }

    // create a new lon with a decremented or incremented rank
    // of all task between the source and the target including
    // the target
    const predicate = (direction === "up") ? rankUp : rankDown;
    let newLon = _.map(db.nodes(), predicate);

    // change the rank of the source task
    const newSourceTask = sourceTask;
    newSourceTask.rank = targetTask.rank;
    console.log(newLon);
    newLon = _.map(newLon, x => {
        if(x.key === newSourceTask.key){
            return newSourceTask;
        } else {
            return x;
        }
    });
    db.resetTasks(newLon);
}