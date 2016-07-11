#!/usr/bin/env node
'use strict';

const infer = require('./');
const spawn = require('@quarterto/spawn');
const path = require('path');

const packagePath = path.resolve('package.json');
const p = require(packagePath);

if(process.env.npm_lifecycle_event && process.env.npm_lifecycle_event !== 'heroku-postbuild') {
	console.log('⤼ not a Heroku automatic deploy, skipping version inference');
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
} else if(!process.env.SOURCE_VERSION) {
	console.log('⁈ supposedly this is a Heroku automatic deploy but there\'s no SOURCE_VERSION. Here\'s your env:');
	console.log(process.env);
	process.exit(1);
} else {
	const repo = typeof p.repository === 'string' ? p.repository : p.repository.url;
	const version = infer(repo.replace(/^git\+/i, ''), process.env.SOURCE_VERSION, p.name);

	console.log(`inferred version ${version}`);
	spawn('npm', ['version', '--git-tag-version=false', version]);
}
