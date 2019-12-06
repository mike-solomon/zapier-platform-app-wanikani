# Wani Kani

[![npm](https://img.shields.io/npm/v/npm.svg?style=flat-square)](https://www.npmjs.com/package/npm)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

The Zapier CLI App for [WaniKani](https://www.wanikani.com/)

## Developing

### Built With

- [Node](https://nodejs.org/en/)
- [ESLint](https://eslint.org/)
- [Prettier-Eslint](https://github.com/prettier/prettier-eslint)
- [Husky](https://github.com/typicode/husky)
- [Lint-Staged](https://github.com/okonet/lint-staged)
- [Chai](https://www.chaijs.com/)

### Prerequisites

You'll need to have the Zapier Platform CLI installed if you haven't already:

```shell
npm install -g zapier-platform-cli
```

### Setting up Dev

Run the following commands to get started locally:

```shell
git clone git@github.com:mikesol314/zapier-platform-app-wanikani.git
cd zapier-platform-app-wanikani
npm install
git checkout -b <branchName>
```

### Deploying / Publishing

- Right now, only I can deploy / publish this app. If you want to make a change, please submit a pull request and, if approved, I'll coordinate rolling it out.
- Whenever a change is going to be pushed out make sure to update the [CHANGELOG.md](CHANGELOG.md) to record what is
  changing (and make sure to enter the version based on the guidance below).

## Versioning

We should use [SemVer](http://semver.org/) for versioning. For the versions available, see the
[CHANGELOG](CHANGELOG.md).

## Tests

Right now all we have are unit tests. You can run them with the command `npm test` or `zapier test` (they're synonomous).

## Style guide

We use [ESLint](https://eslint.org/) and a common set of rules developed by AirBnB with a couple of tweaks. Linting
should occur automatically whenever you make a commit (see [package.json](package.json) for the exact things being run).

With that being said, you can run the following command to run the lint check against all of your files:

```shell
npm run lint
```

Or you can run this to format all of your files properly:

```shell
npm run format
```

## Api References

REST API: https://docs.api.wanikani.com/20170710/
