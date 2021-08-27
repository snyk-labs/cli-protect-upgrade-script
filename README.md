# Snyk CLI Protect command upgrade script

This is a one-off script that should be run by Snyk users that want to remove Snyk CLI from their dependencies while replacing its `protect` functionality with a [`@snyk/protect` package](https://github.com/snyk/snyk/tree/master/packages/snyk-protect#readme).

Execute this locally, in a folder with a `package.json` file.

```
npx @snyk/cli-protect-upgrade
```
