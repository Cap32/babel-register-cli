
const childProcess = require('child_process');

const babelRegisterCli = '../bin/babel-register.js';

describe('babel-node-cli', () => {
	it('run', () => {
		const result = childProcess.execSync(`${babelRegisterCli} ./source`, {
			cwd: __dirname,
			encoding: 'utf8',
		});
		result && console.log(result);
	});

	it('ipc', (done) => {
		const child = childProcess.spawn(babelRegisterCli, ['./source'], {
			cwd: __dirname,
			stdio: ['ipc', 'pipe', 'pipe'],
		});
		child.stdout.on('data', (buf) => {
			console.log(buf.toString());
		});
		child.stderr.on('data', (buf) => {
			console.warn(buf.toString());
		});
		child.on('error', (err) => {
			console.error(err);
		});
		child.on('exit', () => {
			done();
		});
		child.disconnect();
	});
});
