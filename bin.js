#!/usr/bin/env node
'use strict';

const infer = require('./');
const spawn = require('cross-spawn-promise');
const path = require('path');
const logPromise = require('@quarterto/log-promise');
const {check, runChecks} = require('@quarterto/run-checks');
const util = require('util');
const hasbin = require('hasbin');

const packagePath = path.resolve('package.json');
const p = require(packagePath);

const commitish =
	process.env.SOURCE_VERSION
	|| process.env.GIT_COMMIT
	|| process.env.CIRCLE_SHA1
	|| process.env.TRAVIS_COMMIT;

logPromise(
	version => `inferred version ${version}`,
	err => err.message
)(
	runChecks(
		check(
			() => process.env.CI || process.env.npm_lifecycle_event === 'heroku-postbuild',
			'⤼ not a Heroku automatic deploy or a CI build, skipping version inference',
			{fatal: false}
		),
		check(
			() => hasbin.sync('git'),
			'⛭ no Git binary found in PATH'
		),
		check(
			() => p.repository,
			'⊶ expected a repository field in your package.json'
		),
		check(
			() => typeof p.repository === 'string' || p.repository.url,
			`⊶ invalid repository entry in package.json, no url: ${util.inspect(p.repository)}`
		),
		check(
			() => typeof p.repository === 'string' ||p.repository.type === 'git',
			'⊶ non-git repositories not supported'
		),
		check(
			() => commitish,
			`⁈ supposedly this is a Heroku automatic deploy or a CI build but there's no commit hash provided. Here's your env: ${util.inspect(process.env)}`
		)
	).then(() => {
		const repo = typeof p.repository === 'string' ? p.repository : p.repository.url;

		return infer({
			remote: repo.replace(/^git\+/i, ''),
			commitish: commitish,
			dirName: p.name.replace('/', '-'),
			allCommits: process.argv.slice(2).includes('--all-commits')
		}).then(version =>
			spawn('npm', ['version', '--git-tag-version=false', version]).then(
				() => version
			);
		))
	)
).catch(
	err => process.exit(err.fatal === false ? 0 : 1)
);
