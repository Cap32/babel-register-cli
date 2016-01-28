
require('babel-register');
const path = require('path');

const cwd = process.cwd();
const input = process.argv[2];

if (input) {
	require(path.join(cwd, input));
}
else {
	throw new Error('Missing input.');
}
