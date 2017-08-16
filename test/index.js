
const childProcess = require('child_process');
const cmp = require('semver-compare');
const isPortReachable = require('is-port-reachable');
const assert = require('assert');
const delay = require('delay');
const pkg = require('../package.json');

const babelRegisterCli = '../bin/babel-register';

describe('babel-node-cli', () => {
	it('run', () => {
		const result = childProcess.execSync(`${babelRegisterCli} ./source`, {
			cwd: __dirname,
			encoding: 'utf8',
		});
		result && console.log(result);
	});

	it('with --inspect', (done) => {
		const nodeVersion = childProcess.execSync('node --version').toString();
		if (cmp(nodeVersion.slice(1), '6.3.0') > -1) {
			let error;

			const exec = () => {
				const command = `${babelRegisterCli} --inspect ./source`;
				childProcess.exec(command, {
					cwd: __dirname,
					encoding: 'utf8',
					env: Object.assign({ DELAY: 1000 }, process.env),
				}, (err) => {
					done(err || error);
				});

				delay(900)
					.then(() => isPortReachable(9229))
					.then((t) => assert(t, 'b'))
					.catch((err) => error = err)
				;
			};

			isPortReachable(9229)
				.then((reachable) => {
					assert(!reachable, 'a');
				})
				.then(exec)
				.catch((err) => error = err)
			;
		}
	});

	it('version', () => {
		const command = `${babelRegisterCli} --version`;
		const version = childProcess.execSync(command, {
			cwd: __dirname,
			encoding: 'utf8',
		});
		assert(version.trim() === `v${pkg.version}`);
	});

	it('help', () => {
		const command = `${babelRegisterCli} --help`;
		const help = childProcess.execSync(command, {
			cwd: __dirname,
			encoding: 'utf8',
		});
		assert(/Usage/.test(help.split('\n')[0]));
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
			throw err;
		});
		child.on('exit', () => {
			done();
		});
		child.disconnect();
	});
});
