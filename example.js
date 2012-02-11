var kd = require('./kdtree.js');

var tree = new kd.KDTree(3);

var data = [
	[0,0,0],
	[10,10,10],
	[0,9,8],
	[1,9,12],
	[100,100,100],
	[200,200,200]
];

tree.build(data);

var results = tree.nearest([-128,0,10], 1);

console.log('results');
for (var i in results)
	console.log(results[i].node.point + ' distance=%d', results[i].distance);
