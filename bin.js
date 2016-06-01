#!/usr/bin/env node
'use strict';

const infer = require('./');
const spawn = require('@quarterto/spawn');

if(!process.env.RECEIVE_DATA) {
	console.log('Not a Heroku automatic deploy, skipping version inference');
	process.exit(0);
}

const parseGithubUrl = url => {
	const m = url.match(/github\.com\/([^\/]+)\/([^\/]+)(?:$|\/)/);
	return m && {
		user: m[1],
		repo: m[2],
	};
};

const herokuReceiveData = JSON.parse(process.env.RECEIVE_DATA);
const gh = parseGithubUrl(herokuReceiveData.deploy_source);
const cloneUrl = `https://github.com/${gh.user}/${gh.repo}.git`;
const version = infer(cloneUrl, process.env.SOURCE_VERSION, gh.repo);

console.log(`inferred version ${version}`);
spawn('npm', ['version', '--git-tag-version=false', version]);
