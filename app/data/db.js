const fs = require("tns-core-modules/file-system");

const org = require("./markdown-org-mode-parser.js");

/**
 * 
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

/**
 * consumes a task file markdown string and produces a list of nodes
 * @param {String} md the markdown
 * @returns lon 
 */
function mdToNodes(md) {
    const nodes = org.parseBigString(md);
    for (const n of nodes) {
        if (n.level > 1) {
            n.project = project(nodes, n);
        } 
    }
    return nodes;
}

function tasklistFromFile() {
    const folder = fs.knownFolders.currentApp()
    const fpath = fs.path.join(folder.path, "data", "liveflow.md");
    const file = fs.File.fromPath(fpath);
    return mdToNodes(file.readTextSync());
}

exports.tasklistFromFile = tasklistFromFile;