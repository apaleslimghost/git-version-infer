# git-version-infer

infers app versions for automatic heroku deploys and [ci builds](#which-ci)

```sh
npm install --save @quarterto/git-version-infer
```

```json
{
  "name": "my-awesome-heroku-app",
  "version": "0.0.0-development",
  "scripts": {
    "postinstall": "git-version-infer"
  }
}
```

## why

because you want to tag versions for things like error reporting, QA, Tim writing on whiteboards, but you don't want to manually tag things. git-version-infer comes up with an arbitrary monotonically increasing version number automatically, so you don't have to.

## how

the version number is the number of merge commits into the history of the deployed commit. if you have Github branch protection, there will be no code changes on `master` without an associated merge, so a particular version will always contain the same code. this number will increase if *and only if* there are code changes, which is exactly what we need from a version number.

this assumption breaks down with Heroku review apps, where multiple concurrent branches with the same number of merges may be deployed at the same time. to disambiguate in this case, the first 7 characters of the commit hash are appended to the version as semver build metadata.

the inferred version is written to the `version` field in `package.json`. you're probably already used to writing `require('../package.json').version`.

if you use squash merging via GitHub or you can otherwise guarantee that each commit to master is a version, then you can use the `--all-commits` flag to take *every* commit into account rather than just merges:

```sh
git-version-infer --all-commits
```

## which ci

the following ci systems are supported:

  - [circle](https://circleci.com/)
  - [jenkins](https://jenkins.io/) (through the [git plugin](https://wiki.jenkins.io/display/JENKINS/Git+Plugin))
  - [travis](https://travis-ci.org/)

## licence

mit
