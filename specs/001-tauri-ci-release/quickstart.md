# Quickstart: Tauri v2 CI/CD with GitHub Actions

**Feature**: 001-tauri-ci-release
**Last Updated**: 2026-01-20

## Overview

This quickstart guide helps developers use the new GitHub Actions workflows for automated Tauri builds and releases.

## Prerequisites

- Repository must be hosted on GitHub
- GitHub Actions must be enabled for the repository
- Repository must have a valid Tauri v2 project structure
- `Cargo.toml` must have version in format `X.Y.Z`

## Workflow Files

After implementation, two workflow files will be created:

| File | Purpose | Trigger |
|------|---------|---------|
| `.github/workflows/build-validation.yml` | Validates that code builds on all platforms | Push to `master`, PRs to `master` |
| `.github/workflows/release.yml` | Creates release artifacts and GitHub release | Tag push matching `v*.*.*` |

## Daily Development Workflow

### 1. Creating a Pull Request

```bash
git checkout -b feature/my-feature
# Make changes...
git commit -am "Add my feature"
git push origin feature/my-feature
# Create PR on GitHub
```

**What happens automatically**:
- Build validation workflow runs on your PR
- Tests that code compiles on macOS, Linux, and Windows
- Shows checkmark status on the PR

### 2. Merging to Master

```bash
git checkout master
git merge feature/my-feature
git push origin master
```

**What happens automatically**:
- Build validation runs on master branch
- Confirms merge didn't break anything

### 3. Creating a Release

```bash
# Ensure master is up to date
git checkout master
git pull origin master

# Create and push version tag
git tag v1.0.0
git push origin v1.0.0
```

**What happens automatically**:
- Release workflow starts
- Builds installers for all 4 platforms (in parallel)
- Creates GitHub release as draft
- Attaches all artifacts to the release

## First-Time Setup

### Step 1: Verify Workflow Files

After this feature is implemented, verify the workflow files exist:

```bash
ls -la .github/workflows/
# Should show:
# - build-validation.yml
# - release.yml
```

### Step 2: Test Build Validation

Create a test commit and verify validation runs:

```bash
echo "# Test" >> README.md
git commit -am "Test build validation"
git push origin master
```

Go to GitHub → Actions tab → verify workflow runs successfully.

### Step 3: Test Release (Optional)

For first-time setup, create a test release:

```bash
git tag v0.0.1-test
git push origin v0.0.1-test
```

After build completes:
1. Go to Releases page on GitHub
2. Download and test each installer
3. If everything works, delete the test release
4. Delete the local tag: `git tag -d v0.0.1-test`

## Troubleshooting

### Build Validation Fails

**Symptoms**: Red X on commit or PR

**Actions**:
1. Click on the failing workflow run
2. Expand the failed job to see error logs
3. Common issues:
   - Rust compilation error
   - Node dependency installation failed
   - Platform-specific dependency missing

### Release Build Fails

**Symptoms**: Release workflow shows failure

**Actions**:
1. Check which platform(s) failed in the matrix
2. Review logs for the specific failed job
3. Common issues:
   - macOS code signing issues
   - Linux webkit dependencies missing
   - Windows certificate issues

### Release Not Created

**Symptoms**: Workflow completes but no release appears

**Check**:
1. Did the tag follow semantic versioning (`vX.Y.Z`)?
2. Did all platform builds succeed?
3. Check workflow logs for "Create Release" step errors

## Best Practices

### Version Tags

- Always use semantic versioning: `v1.0.0`, `v1.2.3`, `v2.0.0-beta.1`
- Don't use tags without `v` prefix (they won't trigger release)
- Don't reuse tag names (delete and re-push if needed)

### Release Notes

By default, releases are created as drafts. Before publishing:

1. Go to the draft release
2. Add meaningful release notes
3. Review attached artifacts
4. Click "Publish release"

### Branch Protection

Recommended: Enable branch protection on `master`:

1. Go to Settings → Branches
2. Add rule for `master` branch
3. Require status checks to pass before merge
4. Require "build-validation" to pass

## Continuous Improvement

After implementation, consider these enhancements:

- [ ] Automatic release notes from commit messages
- [ ] Slack/Discord notifications on releases
- [ ] Automated testing on release artifacts
- [ ] Beta/alpha release channels

## Support

For issues with the workflows:
1. Check workflow logs in GitHub Actions tab
2. Review [research.md](research.md) for technical details
3. Consult [Tauri Action Documentation](https://github.com/tauri-apps/tauri-action)
