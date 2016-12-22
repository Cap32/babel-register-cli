
'use strict';

const path = require('path');
const yargs = require('yargs');
const pathIsAbsolute = require('path-is-absolute');
const childProcess = require('child_process');
const pkg = require('../package.json');

const procOptions = {
	cwd: process.cwd(),
	env: process.env,
	stdio: ['ipc', 'inherit', 'inherit'],
};

const kexec = (cmd, args) => {
	const child = childProcess.spawn(cmd, args, procOptions);
	child.on('message', (message) => process.send(message));
	process.on('message', (message) => child.send(message));
	process.on('disconnect', () => child.disconnect())
	child.on('exit', (code, signal) => {
		process.on('exit', () => {
			if (signal) {
				process.kill(process.pid, signal);
			} else {
				process.exit(code);
			}
		});
	});
};

const yargv = yargs
	.usage('Usage: $0 <file> [options]')
	.option('debug', {
		type: 'number',
		describe: 'Debug port.'
	})
	.help('h')
	.alias('h', 'help')
	.version(pkg.version)
	.alias('v', 'version')
	.argv
;

const args = [];
const file = yargv._[0];

if (!file) {
	yargs.showHelp();
	process.exit(1);
}

{
	let debug = yargv.debug || yargv['debug-brk'];
	const cmd = yargv.debug ? 'debug' : 'debug-brk';

	if (debug) {
		debug = typeof debug === 'number' ? debug : 5858;
		args.push(`--${cmd}=${debug}`);
	}
}

{
	const dep = pathIsAbsolute(file) ? file : `./${path.normalize(file)}`;
	args.push('-e', `require("babel-register");require("${dep}");`);
}

args.concat(yargv._.splice(1));

kexec(process.argv[0], args);
