
'use strict';

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

const nodeExecPath = process.argv[0];
const argv = process.argv.slice(2);
const args = [];

let firstArg = argv[0];

const isDebugging = ['inspect', 'debug'].indexOf(firstArg) > -1;

if (isDebugging) {
	args.unshift(firstArg);
	argv.shift();
	firstArg = argv[0];
}

if (['-v', '--version'].indexOf(firstArg) > -1) {
	console.log(`v${pkg.version}`);
}
else if (['-h', '--help'].indexOf(firstArg) > -1) {
	childProcess.exec(`${nodeExecPath} --help`, (err, stdout, stderr) => {
		if (err) { throw err; }

		const out = (stdout || stderr).toString();
		const lines = out.split('\n');
		console.log(
			lines
				.map((line) => line.replace(/Node\.js|\bnode\b/g, pkg.name))
				.map((line) => line.replace(/https:\/\/.*\//, pkg.homepage))
				.join('\n')
		);
	});
}
else {
	args.push.apply(args, ['-r', 'babel-register'].concat(argv));
	kexec(nodeExecPath, args);
}


