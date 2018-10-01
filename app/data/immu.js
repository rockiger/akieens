/**
 * simple immutable data structures based on object and Array
 * @module data/immu
 */

function vec(arr) {
    return Object.freeze(arr);
}

function map(obj) {
    return Object.freeze(obj);
}

function push (arr, val) {
    return vec([ ...arr].push(val));
}

function unshift(arr, val) {
    return vec([...arr].unshift(val));
}