# Research: Tauri v2 CI/CD with GitHub Actions

**Feature**: 001-tauri-ci-release
**Date**: 2026-01-20

## Overview

This document consolidates research findings for implementing GitHub Actions workflows for Tauri v2 automated builds and releases.

## Workflow Architecture Decision

### Decision: Two Separate Workflow Files

**Rationale**:
- **Separation of concerns**: Build validation (quality assurance) vs. release (distribution) are distinct operations
- **Independent triggers**: Validation runs on push/PR, release runs on tags only
- **Independent permissions**: Validation doesn't need `contents: write`, release does
- **Failure isolation**: A failed validation doesn't block releases; a failed release doesn't block development
- **Clearer logs**: Separate workflow runs are easier to debug

**Alternatives Considered**:
- **Single workflow with conditional jobs**: More complex, harder to maintain, couples unrelated operations
- **Reusable workflows**: Overkill for this use case, adds indirection without benefit

## Trigger Strategy

### Build Validation Triggers

**Decision**:
```yaml
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]
```

**Rationale**:
- Triggers on every master push to catch integration issues early
- Triggers on all PRs to validate changes before merge
- Uses `master` branch as specified in constitution (not `main`)

**Alternatives Considered**:
- **Wildcard branches (`**`)**: Too noisy, would trigger on feature branches
- **Path filters**: Too restrictive, might miss dependencies changes

### Release Triggers

**Decision**:
```yaml
on:
  push:
    tags:
      - '**'
```

**Rationale**:
- Triggers on ANY tag pushed (no format restriction)
- Simplifies release process - maintainer has full control
- Maintainer can use any naming convention that works for their project

**Alternatives Considered**:
- **All tags (`*`)**: Too broad, would trigger on non-version tags
- **Manual dispatch (`workflow_dispatch`)**: Defeats automation goal

## Platform Matrix Configuration

### Decision: 4-Job Matrix with Platform-Specific Args

**Rationale**:
- **macOS ARM64 + x86_64**: Apple Silicon and Intel Macs need different binaries
- **Ubuntu 22.04**: Stable LTS with good Tauri support
- **Windows Latest**: Covers 99%+ of Windows users

**Alternatives Considered**:
- **Universal macOS binary**: Not supported by Tauri, must build separately
- **Multiple Linux distros**: Unnecessary, .AppImage and .deb work across distros

### Matrix Implementation

```yaml
strategy:
  fail-fast: false
  matrix:
    include:
      - platform: 'macos-latest'
        args: '--target aarch64-apple-darwin'
      - platform: 'macos-latest'
        args: '--target x86_64-apple-darwin'
      - platform: 'ubuntu-22.04'
        args: ''
      - platform: 'windows-latest'
        args: ''
```

**Key Decision**: `fail-fast: false`

**Rationale**:
- If one platform fails, others continue to build
- Maintainer gets all results, not just the first failure
- Partial failures don't waste already-completed builds

## Tauri Action Configuration

### Decision: Use `tauri-apps/tauri-action@v1`

**Rationale**:
- Official action maintained by Tauri team
- Handles all platform-specific complexity
- Automatically creates GitHub releases
- Generates updater JSON for in-app updates

### Release Configuration

```yaml
with:
  tagName: v__VERSION__
  releaseName: 'Version __VERSION__'
  releaseBody: 'See the assets to download this version and install.'
  releaseDraft: true
  prerelease: false
  args: ${{ matrix.args }}
```

**Key Decisions**:

1. **`releaseDraft: true`**: Releases start as drafts for manual review before publishing
2. **`prerelease: false`**: Standard releases, not pre-releases
3. **`__VERSION__` placeholder**: Action auto-replaces with version from `Cargo.toml`

**Alternatives Considered**:
- **`releaseDraft: false`**: Too risky, might publish broken releases
- **`generateReleaseNotes: true`**: Nice but can add later, manual notes are fine for now

## Dependency Installation

### Decision: Platform-Specific Dependency Steps

**macOS**:
```yaml
- uses: dtolnay/rust-toolchain@stable
  with:
    targets: aarch64-apple-darwin,x86_64-apple-darwin
```

**Linux**:
```yaml
- name: Install dependencies
  run: |
    sudo apt-get update
    sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

**Windows**: No additional dependencies (handled by action)

**Rationale**:
- macOS needs cross-compilation targets for both architectures
- Linux needs webkit libraries for WebView (Tauri dependency)
- Windows runners come pre-configured

## Build Validation Workflow

### Decision: Minimal Build Without Release Creation

**Approach**: Same build steps as release, but don't create GitHub release

**Rationale**:
- Validates that the code compiles on all platforms
- Faster than release (no signing, no asset upload)
- No risk of accidental releases

**Implementation**:
```yaml
- uses: tauri-apps/tauri-action@v0
  with:
    args: --debug ${{ matrix.args }}
```

**Note**: Use `@v0` (build-only) or omit release parameters to skip release creation

## Error Handling

### Decision: Fail-Fast for Validation, Continue for Release

**Build Validation**: `fail-fast: true` (default)
- Stop immediately on any failure
- Faster feedback to developers

**Release**: `fail-fast: false`
- Continue all platform builds even if one fails
- More information for debugging

## Artifact Management

### Decision: Let Tauri Action Handle Artifacts

**Rationale**:
- Action automatically generates correct artifacts per platform
- Attachments to GitHub releases are automatic
- Updater JSON is generated with correct URLs

**Artifacts Generated**:
| Platform | Artifacts |
|----------|-----------|
| macOS ARM64 | .dmg (universal via `lipo` or separate) |
| macOS x86_64 | .dmg |
| Linux | .AppImage, .deb |
| Windows | .msi, .exe (NSIS) |

## Performance Optimization

### Decision: Caching for Dependencies

**Implementation**: Use GitHub Actions cache for Node modules and Cargo registry

```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      ~/.cargo/registry
    key: ${{ runner.os }}-deps-${{ hashFiles('**/package-lock.json') }}
```

**Rationale**:
- Reduces build time by 30-50%
- Free tier cache quota (10GB) is sufficient

## Security Considerations

### Decision: Minimal Permissions

**Build Validation**: No special permissions needed

**Release**:
```yaml
permissions:
  contents: write
```

**Rationale**:
- Validation only needs to read code
- Release needs to create releases and upload assets
- Principle of least privilege

## Testing Strategy

### Decision: Manual Testing for First Release

**Approach**:
1. Create test tag (e.g., `v0.0.1-test`)
2. Verify all artifacts are generated
3. Download and test each installer
4. Verify updater JSON is correct
5. Delete test release
6. Repeat if needed before real release

**Rationale**:
- First CI/CD setup needs validation
- Testing installers on actual hardware is essential
- Better to catch issues in draft release

## Unresolved Questions

None. All technical decisions are documented above.

## References

- [Tauri Action Documentation](https://github.com/tauri-apps/tauri-action)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Tauri Distribution Guide](https://v2.tauri.app/distribute/)
