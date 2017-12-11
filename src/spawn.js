const spawn = require('cross-spawn-promise');

module.exports = (cmd, args) => spawn(cmd, args).catch(
	e => {
		e.message = `${cmd} ${args.join(' ')} ${e.message}`;
		if(e.stderr) {
			console.log(e.stderr.toString());
		}
		throw e;
	}
);
