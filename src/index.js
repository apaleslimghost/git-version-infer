'use strict';

const promisify = require('@quarterto/promisify');
const mkTempDir = promisify(require('temp').track().mkdir);
const spawn = require('cross-spawn-promise');

module.exports = async function infer({remote, commitish, dirName, allCommits}) {
	const dir = await mkTempDir(dirName || 'heroku-version-infer');
	await spawn('git', ['clone', '--bare', remote, dir]);

	const oldDir = process.cwd();
	process.chdir(dir);

	try {
		const shaResult = await spawn('git', ['rev-list', '--max-count=1', commitish]);
		const sha = shaResult.toString().trim();

		const revListArgs = ['rev-list', sha];
		if (!allCommits) {
			revListArgs.push('--merges', '--first-parent');
		}

		const revListResult = await spawn('git', revListArgs);
		const majorVersion = revListResult.toString().split('\n').length;

		return `${majorVersion}.0.0-heroku-${sha.substr(0, 7)}`;
	} finally {
		process.chdir(oldDir);
	}
};
