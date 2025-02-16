## Testing

### Development

Basic testing:

```bash
npm run test:foundation
```

Including code coverage (find coverage in `tests/foundation/.coverage`):

```bash
npm run test:foundation -- --coverage
```

#### Usage

Before running usage tests build the package with `npm run package:build` and install it in the `.usage` folder.`:

```bash
cd .usage
npm install

# Now run the usage tests in the .usage folder
npm run test:usage
```

## Release

[used just as a reference] The release workflow on the monorepo.

- Merge finished feature branch to `develop` branch.
- Branch out from `develop` to `release/markdown-merger/vX.X.X` branch (keep the name standard as it triggers the CI).
  - Prepare the release: bump up version; later, when released, push tag and create release notes on Github;
  - Run `npm run package:build` to check the version builds fine;
- Merge the release branch back to `develop`; Push to remote.
  - The push to `develop` will trigger the CI;
  - Check its success;
  - No release tagging for `develop` branch;
  - No test coverage publish;
- Merge the release branch into `master`;
  - Amend the merge commit message with `[markdown-merger] Release (package): vX.X.X`;
  - Locally in `master` branch run `npm run package:build` and `npm run package:publish`.
  - Will test and build the package;
  - Push to remote.
  - Pushes the [subtree](#manage-public-version-with-git-subtree) to the remote dedicated public repository;
  - The push to master will trigger the CI; Check its success;
  - The CI must create and push the `oas-markdown-merger@vX.X.X` tag to the monorepo;
  - The CI must publish test coverage;
  - Manually push `oas-markdown-merger@vX.X.X` tag to the public split repository;

## Manage Public Version with Git Subtree

Use Git Subtree to be able to expose code publicly and accept the OSS contributions.

Separate the package-subfolder-only commits to a dedicated temporary branch:

```bash
git subtree split --prefix=packages/utilities/markdown-merger -b split/markdown-merger
```

Create the remote repository and push the temp branch content there:

```bash
git push https://github.com/WhereJuly/60-1-oas-markdown-merger.git split/markdown-merger:master
```

Remove the temp branch; Conduct the development as usual committing and pushing to the remote monorepo as usual;

When need to update the subtree repository from local repository make:

```bash
git subtree push --prefix=packages/utilities/markdown-merger https://github.com/WhereJuly/60-1-oas-markdown-merger.git master
```

When need to pull the subtree repository changes (e.g. if it is exposed as open source) make:

```bash
git subtree pull --prefix=packages/utilities/markdown-merger https://github.com/WhereJuly/60-1-oas-markdown-merger.git master
```
