# project-with-patchable-dep-fixture-yarn

This project is for test testing `@snyk/protect` with a yarn project.

It uses the private package `@snyk/patchable-dep-fixture` which has a dependency of `lodash@14.17.15` which has a vulnerability for which we have a patch.

The intent is to import this project into Snyk and create a Fix PR that relies on the patch mechanism and thus `@snyk/protect`.
