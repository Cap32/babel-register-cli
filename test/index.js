
const execSync = require('child_process').execSync;

const babelRegisterCli = '../bin/babel-register.js';

describe('babel-node-cli', () => {
	it('run', () => {
		const result = execSync(`${babelRegisterCli} ./source -r shit`, {
			cwd: __dirname,
			encoding: 'utf8',
		});
		result && console.log(result);
	});
});
