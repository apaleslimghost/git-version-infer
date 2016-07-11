#!/usr/bin/env node
'use strict';

const infer = require('./');
const spawn = require('@quarterto/spawn');
const path = require('path');

const packagePath = path.resolve('package.json');
const {repository} = require(packagePath);

if(process.env.npm_lifecycle_event && process.env.npm_lifecycle_event !== 'heroku-postbuild') {
	console.log('⤼ not a Heroku automatic deploy, skipping version inference');
	process.exit(0);
} else if(!repository) {
	console.log('⊶ expected a repository field in your package.json');
	process.exit(1);
} else if(typeof repository !== 'string' || !repository.url) {
	console.log('⊶ invalid repository entry in package.json, no url');
	process.exit(1);
} else if(!repository.type === 'git') {
	console.log('⊶ non-git repositories not supported');
	process.exit(1);
} else if(!process.env.SOURCE_VERSION) {
	console.log('⁈ supposedly this is a Heroku automatic deploy but there\'s no SOURCE_VERSION. Here\'s your env:');
	console.log(process.env);
	process.exit(1);
} else {
	const version = infer(typeof repository === 'string' ? repository : repository.url , process.env.SOURCE_VERSION, gh.repo);

	console.log(`inferred version ${version}`);
	spawn('npm', ['version', '--git-tag-version=false', version]);
}
