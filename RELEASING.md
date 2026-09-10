How to Create a Release
=======================

Creating a Release with the Github Action
-----------------------------------------

1. Ensure updates are listed in CHANGLOG.md in the `[Unreleased]` section.
   Once you trigger a new release, unreleased changes are automatically moved under the new version heading.

2. Navigate to [Actions](https://github.com/pbatey/query-to-mongo/actions) and run the **Release package**
   workflow.

   or, trigger the Release from the command line

   ```
   brew install gh
   gh auth login
   gh workflow run "Release package" -f release-type=minor
   ```

   > ***Note***: Valid release types are:
   > - patch, minor, major, prepatch, preminor, premajor, and prerelease
   >
   > Pre-releases are tagged with '-beta.N', where N is incremented.

or...

Creating a Release Manually
---------------------------

1. Update CHANGELOG.md by moving any changes in the `[Unreleased]` section to a
   new release section

   ```
   ## Unreleased

   ## 0.1.0 - 2024-07-02
   ### Added
   - Initial Version
   ```

   And commit it with `git add CHANGELOG.md && git commit -m 'chore: Update CHANGELOG.md`

2. Ensure all unit tests pass with `npm test`
3. Use `npm version major|minor|patch` to increment the version in _package.json_ and tag the release
4. Push the tags `git push origin master --tags`
5. Publish the release `npm publish ./`
