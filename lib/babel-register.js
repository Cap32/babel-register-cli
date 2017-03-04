
'use strict';

const yargs = require('yargs');
const childProcess = require('child_process');
const pkg = require('../package.json');

const procOptions = {
	stdio: [
		process.connected ? 'ipc' : 'inherit',
		'inherit',
		'inherit',
	],
};

const kexec = (cmd, args) => {
	const child = childProcess.spawn(cmd, args, procOptions);
	child.on('message', (message) => process.send(message));
	process.on('message', (message) => child.send(message));
	process.on('disconnect', () => child.disconnect());
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
	.usage('Usage: $0 <module> [options]')
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

const modulePath = yargv._[0];

if (!modulePath) {
	yargs.showHelp();
	process.exit(1);
}

const args = [modulePath];
const requireArgs = ['-r', 'babel-register']
	.concat([]
		.concat(yargv.require || yargv.r)
		.filter(Boolean)
		.reduce((arr, module) => arr.concat(['-r', module]), [])
	)
	.filter(Boolean)
;

args.unshift(...requireArgs);

{
	let debug = yargv.debug || yargv['debug-brk'];

	if (debug) {
		const cmd = yargv.debug ? 'debug' : 'debug-brk';
		debug = typeof debug === 'number' ? debug : 5858;
		args.push(`--${cmd}=${debug}`);
	}
}

args.concat(yargv._.splice(1));

kexec(process.argv[0], args);
