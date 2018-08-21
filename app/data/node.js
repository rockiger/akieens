/**
 * Functions that create, convert and compare nodes
 * @module data/node
 */


/***********
 * Exports *
 ***********/

exports.isNewerDate = isNewerDate;
exports.tagsString = tagsString;
exports.lonFromFile = lonFromFile;


/******************
 * Module imports *
 ******************/

const fs = require("tns-core-modules/file-system");
const _ = require("underscore");
const org = require("./markdown-org-mode-parser.js");
const {checkExpect, notEmpty} = require("./helpers.js");
const dd = require("./datadefinitions.js");


/*************
 * Constants *
 *************/

const {TODO, DOING, DONE, ALL} = require("./constants.js");
const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


/*************
 * Functions *
 *************/

/**
 * Returns a unique key for new nodes.
 * @returns bool
 */
function toKey(level=2) {
    return _.uniqueId('node_')+"."+"#".repeat(level);
}
checkExpect(typeof(toKey()), "string");
checkExpect((toKey().endsWith("##")), true);

/**
 * Compares 2 Nodes, the key of the nodes is ignored,
 * because it's random.
 * @param {Node} n1 
 * @param {Node} n2 
 * @returns bool
 */
function nodeEquals(n1, n2) {
    return _.isEqual(n1.level,      n2.level) &&
           _.isEqual(n1.headline,   n2.headline) &&
           _.isEqual(n1.body,       n2.body) &&
           _.isEqual(n1.tag,        n2.tag) &&
           _.isEqual(n1.tags,       n2.tags) &&
           _.isEqual(n1.todo,       n2.todo) &&
           _.isEqual(n1.priority,   n2.priority) &&
           _.isEqual(n1.scheduled,  n2.scheduled) &&
           _.isEqual(n1.deadline,   n2.deadline) &&
           _.isEqual(n1.fin,        n2.fin) &&
           _.isEqual(n1.properties, n2.properties) &&
           _.isEqual(n1.drawer,     n2.drawer) &&
           _.isEqual(n1.rank,       n2.rank) &&
           _.isEqual(n1.repeat,     n2.repeat) &&
           _.isEqual(n1.style,      n2.style);

}
checkExpect(nodeEquals(dd.N1, dd.N1a), true);
checkExpect(nodeEquals(dd.N1, dd.N2), false);


function toRepeat(s) {
    if (!s) {
        return null
    } else {
        if (notEmpty(toUnit(s))){
            return {rate: toRate(s), unit: toUnit(s)};
        }

        function toUnit(s) {
            if (s.includes("weekdaily")) {
                return "weekdaily";
            } else if (s.includes("daily")) {
                return "daily";
            } else if (s.includes("weekly")) {
                return "weekly";
            } else if (s.includes("monthly")) {
                return "monthly";
            } else if (s.includes("yearly")) {
                return "yearly";
            } else {
                return "";
            }
        }

        function toRate(s) {
            if (!isNaN(parseInt(s))) {
                return parseInt(s);
            } else {
                return 1;
            }
        }
    }
}
checkExpect(toRepeat("1 daily"),           {rate: 1, unit: "daily"});
checkExpect(toRepeat("2 weekly"),          {rate: 2, unit: "weekly"});
checkExpect(toRepeat("12 monthly"),        {rate: 12, unit: "monthly"});
checkExpect(toRepeat("01 yearly"),         {rate: 1, unit: "yearly"});
checkExpect(toRepeat("1 weekdaily"),       {rate: 1, unit: "weekdaily"});
checkExpect(toRepeat("1 daily,weekdaily"), {rate: 1, unit: "weekdaily"});


/**
 * Consumes a Taskstate, a headline, a project name and a Rank; 
 * produces a Node
 * @param {TaskStae} taskstate 
 * @param {String} headline 
 * @param {String} project 
 * @param {rank} rank 
 * @returns {Node}
 */
function toNode(taskstate, headline, project, rank){
    return {
        key: toKey(),
        level: 2,
        headline: headline,
        body: "",
        tag: null,
        tags: {},
        todo: taskstate,
        priority: null,
        scheduled: null,
        deadline: null,
        fin: null,
        properties: {},
        drawer: {},
        rank: rank,
        repeat: null,
        style: null,
        project: project
    };
}
checkExpect(nodeEquals(toNode(TODO, "Test Headline", "Inbox", 10),
                      {key: null, level: 2, headline: "Test Headline", 
                       body: "", tag: null, tags: {}, todo: TODO, priority: null,
                       scheduled: null, deadline: null, fin: null, properties: {},
                       drawer: {}, rank: 10, repeat: null, style: null, 
                       project: "Inbox"}),
            true);


/**
 * Consumes a list of Nodes, a Node and returns the project of n;
 * defaults to "Inbox"
 * @param {ListOfNode} lon 
 * @param {Node} node
 * @returns {String} the project name
 */
function project (lon, node) {
    let pr = "Inbox";
    for (const n of lon) {
        if (n.key === node.key) {
            return pr;
        } else if (n.level === 1) {
            pr = n.headline;
        }
    }
    return pr;
}
const lon = [{key: toKey(), headline: "head 1", level: 1},
             toNode("TODO", "Task 1", "head 1", 1),
             toNode("TODO", "Task 2", "head 1", 2),
             toNode("TODO", "Task 3", "head 1", 3),
             {key: toKey(), headline: "head 2", level: 1},
             toNode("TODO", "Task 3", "head 2", 4),
             toNode("TODO", "Task 3", "head 2", 5),
             toNode("TODO", "Task 3", "head 2", 6)];
(checkExpect(project(lon, lon[1]), "head 1"));
(checkExpect(project(lon, lon[2]), "head 1"));
(checkExpect(project(lon, lon[3]), "head 1"));
(checkExpect(project(lon, lon[5]), "head 2"));
(checkExpect(project(lon, lon[6]), "head 2"));
(checkExpect(project(lon, lon[7]), "head 2"));


/**
 * Consumes a task file markdown string and produces a list of nodes
 * TODO find way to test, without key:
 * @param {String} md the markdown
 * @returns lon 
 */
function mdToLon(md) { // function name was toNodesFromMd
    const nodes = org.parseBigString(md);
    for (const n of nodes) {
        if (n.level > 1) {
            n.project = project(nodes, n);
        } 
    }
    return nodes;
}


/**
 * TODO Consumes the path p to the task file and produces a list of nodes
 * TODO find way to test, without :key
 * @param {String} - path
 * @returns {ListOfNode}
 * TODO finish, when fileoperations module is created
 */
function lonFromFile(fpath) {
    const file = fs.File.fromPath(fpath);
    return mdToLon(file.readTextSync()) ;
}


function toTimestamp(date) {
    const year = date.getFullYear();
    const month = ("-" + (date.getMonth() + 1));
    const day = ("-" + date.getDate());
    return  "<" + year + month + day + ">";
}
const D1 = new Date(2018, 6, 29);
checkExpect(toTimestamp(new Date(2018, 6, 29)),
            "<2018-7-29>");

/**
 * Converts a ListOfNode to a markdown string
 * @param {ListOfNode} lon 
 * @returns {string}
 */
function lonToMd(lon) {
    function lonToMdHelper(result, n) {
        let str = "";
        str += n.level === 1 ? "# " : "## ";
        str += n.todo ? (n.todo + " ") : "";
        str += n.headline.trim();
        str += notEmpty(n.tags) ? (":" + _.keys(n.tags).join(":") + ":") : "";
        str += "\n";
        str += notEmpty(n.body) ? (n.body + "\n") : "";
        str += n.rank ? ("RANK: " + n.rank + "\n") : "";
        //str += n.repeat ? ("REPEAT: " + n.repeat.rate + " " + n.repeat.unit + "\n") : "";
        str += n.scheduled ? ("SCHEDULED: " + toTimestamp(n.scheduled) + "\n") : "";
        str += n.deadline ? ("DEADLINE: " + toTimestamp(n.deadline) + "\n") : "";
        str += n.fin ? ("FIN: " + toTimestamp(n.fin) + "\n") : "";

        return result + str;
    }
    return _.reduce(lon, lonToMdHelper, "");
}
checkExpect(lonToMd([toNode(TODO, "Ueberschrift", "Inbox", 1)]),
            "## TODO Ueberschrift\nRANK: 1\n");


/**
 * Determens if Node n1 has a higher Rank than Node n2        
 * @param {Rank} n1
 * @param {Rank} n2
 * @return bool
 */
function isHigherRank(n1, n2) {
    if(_.isNull(n2)) {
        return true;
    } else if (!_.isNull(n2) && _.isNull(n1)) {
        return false;
    } else if (n2 < n1) {
        return false;
    } else {
        return true;
    }
}
checkExpect(isHigherRank(1, 2), true);
checkExpect(isHigherRank(2, 1), false);
checkExpect(isHigherRank(1, 1), true);



function isNewerDate(d1, d2) {
    if (_.isNull(d2)) {
        return true;
    } else if (!_.isNull(d2) && _.isNull(d1)) {
        return false;
    } else if (d1 > d2) {
        return true;
    } else {
        return false;
    }
}
checkExpect(isNewerDate(new Date(2018, 1, 1), new Date(2017, 1, 1)), true);
checkExpect(isNewerDate(new Date(2017, 1, 1), new Date(2018, 1, 1)), false);
checkExpect(isNewerDate(new Date(2018, 1, 1), new Date(2018, 1, 1)), false);


/**
 * Consumes a Node n and produces the comma seperated String based on the n's tags
 * @param {Node} n 
 * @returns {String}
 */
function tagsString(n) {
    if (notEmpty(n.tags)) {
        return _.keys(n.tags).join(", ");
    } else {
        return "";
    }
}
checkExpect(tagsString({headline: "node1", tags: {}}), "");
checkExpect(tagsString({headline: "node1", tags: {tag1: true, tag2: true, tag3: true}}), "tag1, tag2, tag3");



function repsString(n) {
    if (_.has(n.repeat, "unit") && _.has(n.repeat, "rate") && (n.repeat.unit.length > 0)) {
        return n.repeat.rate + " " + n.repeat.unit;
    }
    return "";
}
checkExpect(repsString({repeat: null}), "");
checkExpect(repsString({repeat: {rate: 1, unit: "daily"}}), "1 daily");
checkExpect(repsString({repeat: {rate: 2, unit: "daily"}}), "2 daily");
checkExpect(repsString({repeat: {rate: 1, unit: ""}}), "");