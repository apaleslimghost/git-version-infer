'use strict';

const temp = require('temp').track();
const spawn = require('@quarterto/spawn');

module.exports = function infer(remote, commitish, dirName) {
	const dir = temp.mkdirSync(dirName || 'heroku-version-infer');
	spawn('git', ['clone', '--bare', remote, dir]);

	const oldDir = process.cwd();
	process.chdir(dir);

	try {
		const shaResult = spawn('git', ['rev-list', '--max-count=1', commitish]);
		const sha = shaResult.stdout.toString().trim();

		const mergesResult = spawn('git', ['rev-list', sha, '--merges', '--first-parent']);
		const merges = mergesResult.stdout.toString().split('\n').length;

		return `${merges}.0.0-heroku-${sha.substr(0, 7)}`;
	} finally {
		process.chdir(oldDir);
	}
};
