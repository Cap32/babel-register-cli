
const execSync = require('child_process').execSync;

const babelRegisterCli = '../bin/babel-register.js';

describe('babel-node-cli', () => {
	it('run', () => {
		execSync(`${babelRegisterCli} ./source`, { cwd: __dirname });
	});
});
