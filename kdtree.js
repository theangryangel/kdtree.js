"use strict";

(function(exports)
{

var KDNode = function(point, left, right, axis, data)
{
	this.point = point;

	this.left = left;
	this.right = right;

	this.axis = axis;

	// payload
	// TODO figure out a better way of setting this
	// mapper callback?
	this.data = data;

	this.id = this.genId();
}

KDNode.prototype.genId = function()
{
	var id = '';

	for (var i in this.point.length)
		id += '-' + this.point[i];

	return id.substr(1);
}

KDNode.prototype.isLeaf = function()
{
	return (!this.left);
}

KDNode.prototype.distanceSquared = function(point, dimensions)
{
	// sqrt is expensive, we dont need the real value
	var distance = 0;

	for (var i = 0; i < dimensions; i++)
		distance += Math.pow((this.point[i] - point[i]), 2);

	return distance;
}

var KDTree = function(dimensions, data)
{
	if (!dimensions || dimensions <= 0)
		throw new RangeError('Invalid dimensions for KDTree');

	// how many dimensions we're working with here
	this.dimensions = dimensions;

	// total number of nodes 
	// debugging only
	this.count = 0;

	// root node
	this.root = this._build(data);
}

KDTree.prototype.build = function(data)
{
	this.root = this._build(data);
}

KDTree.prototype._build = function(data, depth)
{
	if (!Array.isArray(data) || (data.length <= 0))
		return;

	var depth = depth || 0;
	var axis = depth % this.dimensions;

	if (data.length == 1)
		return new KDNode(data[0], undefined, undefined, axis);

	var median = Math.floor(data.length / 2);

	// sort by the axis
	data.sort(function(a, b)
	{
		return a[axis] - b[axis];
	});

	var left = data.slice(0, median);
	var right = data.slice(median + 1);

	this.count++;

	var node = new KDNode(
		data[median].slice(0, this.dimensions), 
		this._build(left, depth + 1),
		this._build(right, depth + 1),
		axis
	);

	return node;
}

KDTree.prototype._searchNodeToResult = function(node, distance)
{
	return { 'node': node, 'distance': distance };
}

KDTree.prototype._search = function(node, point, count, depth, results)
{
	if (!node)
		return;

	var axis = depth % this.dimensions;

	var distance = node.distanceSquared(point, this.dimensions);

	// this is a better match than anything we've already got?
	var i = results.length;

	if (i == 0)
		results.push(this._searchNodeToResult(node, distance));

	for (i = 0; i < results.length; i++)
	{
		if (distance < results[i].distance)
			break;
	}

	// splice in our result
	if ((i >= 0) &&  (i <= count))
	{
		// console.log('splicing in ' + node.point + ' with dist=' + distance + ' at ' + i);
		results.splice(i, 0, this._searchNodeToResult(node, distance));
	}

	// get rid of any extra results
	while (results.length > count)
		results.pop();

	// whats got the got best _search result? left or right?
	var goLeft = node.point[axis] < point[axis];

	var target = goLeft ? node.left : node.right;
	var opposite = goLeft ? node.right : node.left;

	// target has our most likely nearest point, we go down that side of the
	// tree first
	if (target)
		this._search(target, point, count, depth + 1, results);

	// _search the opposite direction, only if there is potentially a better
	// value than the longest distance we already have in our _search results
	if ((opposite) && (opposite.distanceSquared(point, this.dimensions) <= results[results.length - 1].distance))
		this._search(opposite, point, count, depth + 1, results);
}

KDTree.prototype.nearest = function(point, count)
{
	var count = count || 1;

	var results = [];

	this._search(this.root, point, count, 0, results);

	if (results.length > count)
		return results.slice(0, count);

	return results;
}

KDTree.prototype.insert = function(point)
{
	var node = point;

	if (Array.isArray(point))
		node = new KDNode(point.slice(0, this.dimensions));

	// TODO _search and insert at the appropriate point
}

KDTree.prototype.rebalance = function()
{
	// TODO rebalance
}

exports.KDTree = KDTree;
exports.KDNode = KDNode;

exports.create = function(dimensions, data)
{
	return new KDTree(dimensions, data);
}


}(typeof exports === "undefined"
        ? (this.KDTree = {})
        : exports));

