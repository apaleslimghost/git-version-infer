#!/usr/bin/env node
'use strict';

const infer = require('./');
const spawn = require('cross-spawn-promise');
const path = require('path');
const logPromise = require('@quarterto/log-promise');

const packagePath = path.resolve('package.json');
const p = require(packagePath);

let environment;
let commitish;
if (process.env.CI) {
	environment = 'ci';
	commitish = process.env.GIT_COMMIT || process.env.CIRCLE_SHA1 || process.env.TRAVIS_COMMIT;
} else if (process.env.npm_lifecycle_event && process.env.npm_lifecycle_event !== 'heroku-postbuild') {
	environment = 'heroku';
	commitish = process.env.SOURCE_VERSION;
}

if(!environment) {
	console.log('⤼ not a Heroku automatic deploy or a CI build, skipping version inference');
	process.exit(0);
} else if(!p.repository) {
	console.log('⊶ expected a repository field in your package.json');
	process.exit(1);
} else if(typeof p.repository !== 'string' && !p.repository.url) {
	console.log('⊶ invalid repository entry in package.json, no url:', p.repository);
	process.exit(1);
} else if(!p.repository.type === 'git') {
	console.log('⊶ non-git repositories not supported');
	process.exit(1);
} else if(!commitish) {
	console.log('⁈ supposedly this is a Heroku automatic deploy or a CI build but there\'s no commit hash provided. Here\'s your env:');
	console.log(process.env);
	process.exit(1);
} else {
	const repo = typeof p.repository === 'string' ? p.repository : p.repository.url;
	logPromise(
		version => `inferred version ${version}`,
		err => err.stack
	)(infer({
		remote: repo.replace(/^git\+/i, ''),
		commitish: commitish,
		dirName: p.name.replace('/', '-'),
		allCommits: process.argv.slice(2).includes('--all-commits')
	}).then(version => {
		return spawn('npm', ['version', '--git-tag-version=false', version]).then(() => version);
	})).catch(() => process.exit(1));
}
