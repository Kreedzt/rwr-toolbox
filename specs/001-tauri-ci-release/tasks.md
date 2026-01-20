# Tasks: Tauri v2 CI/CD with GitHub Actions

**Input**: Design documents from `/specs/001-tauri-ci-release/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Manual testing via GitHub Actions UI and installer verification (no automated tests in spec)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Workflows**: `.github/workflows/` at repository root
- This is a DevOps/Infrastructure feature - no application code

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create GitHub Actions directory structure

- [x] T001 Create `.github/workflows/` directory at repository root
- [x] T002 Verify GitHub Actions is enabled for the repository (enabled by default)
- [x] T003 Verify `Cargo.toml` has valid version format (X.Y.Z) - confirmed: version = "0.1.0"

---

## Phase 2: Foundational (Shared Configuration)

**Purpose**: Common workflow configuration shared by both workflows

> **NOTE**: This feature has minimal foundational requirements as the two workflows are largely independent

- [x] T004 [P] Determine Node.js version to use (check package.json for engines or use LTS) - using LTS (lts/*)
- [x] T005 [P] Verify Tauri project structure is valid (src-tauri/ directory exists, tauri.conf.json present) - confirmed
- [x] T006 [P] Document any environment variables or secrets needed (create placeholder list) - documented in workflow comments

**Checkpoint**: Foundation ready - workflow implementation can now begin

---

## Phase 3: User Story 1 - Automated Build Validation (Priority: P1) 🎯 MVP

**Goal**: Every push to master and every PR triggers automated build validation on all platforms

**Independent Test**: Push a commit to master or create a PR and verify the build validation workflow runs and reports status correctly

### Implementation for User Story 1

- [x] T007 [US1] Create `.github/workflows/build-validation.yml` with workflow name and basic structure
- [x] T008 [US1] Add trigger configuration for master push and PRs in `.github/workflows/build-validation.yml`
- [x] T009 [US1] Add 4-platform matrix strategy (macOS ARM64, macOS x86_64, Linux, Windows) in `.github/workflows/build-validation.yml`
- [x] T010 [US1] Add checkout step using `actions/checkout@v4` in `.github/workflows/build-validation.yml`
- [x] T011 [US1] Add Node.js setup step using `actions/setup-node@v4` in `.github/workflows/build-validation.yml`
- [x] T012 [US1] Add Rust toolchain setup using `dtolnay/rust-toolchain@stable` in `.github/workflows/build-validation.yml`
- [x] T013 [US1] Add macOS cross-compilation targets (aarch64-apple-darwin,x86_64-apple-darwin) in `.github/workflows/build-validation.yml`
- [x] T014 [US1] Add Linux dependency installation step (libwebkit2gtk-4.1-dev, libappindicator3-dev, librsvg2-dev, patchelf) in `.github/workflows/build-validation.yml`
- [x] T015 [US1] Add frontend dependency installation step (pnpm install) in `.github/workflows/build-validation.yml`
- [x] T016 [US1] Add Tauri build step using `tauri-apps/tauri-action@v1` with debug mode in `.github/workflows/build-validation.yml`
- [x] T017 [US1] Configure build validation to NOT create releases (omit release parameters) in `.github/workflows/build-validation.yml`
- [x] T018 [US1] Set `fail-fast: true` for immediate feedback on validation failures in `.github/workflows/build-validation.yml`

### Verification for User Story 1

> **NOTE**: Tasks T019-T022 require manual verification after pushing to GitHub.

- [ ] T019 [US1] Test build validation by pushing to master branch - verify workflow runs in GitHub Actions tab (MANUAL)
- [ ] T020 [US1] Test build validation by creating a PR - verify workflow runs and shows status on PR (MANUAL)
- [ ] T021 [US1] Verify successful build shows green checkmark on commit/PR (MANUAL)
- [ ] T022 [US1] Intentionally break a build (e.g., syntax error) and verify error notification works (MANUAL)

**Checkpoint**: At this point, User Story 1 should be fully functional - all commits and PRs automatically validated

---

## Phase 4: User Story 2 - Automated Multi-Platform Release Builds (Priority: P1)

**Goal**: Creating a git tag automatically generates release artifacts for all platforms

**Independent Test**: Create a version tag and verify platform-specific installers are generated and attached to a GitHub release

### Implementation for User Story 2

- [x] T023 [P] [US2] Create `.github/workflows/release.yml` with workflow name and basic structure
- [x] T024 [US2] Add trigger configuration for version tags (v*.*.*) in `.github/workflows/release.yml`
- [x] T025 [US2] Add `contents: write` permission for creating releases in `.github/workflows/release.yml`
- [x] T026 [US2] Add 4-platform matrix strategy with `fail-fast: false` in `.github/workflows/release.yml`
- [x] T027 [US2] Add checkout step using `actions/checkout@v4` in `.github/workflows/release.yml`
- [x] T028 [US2] Add Node.js setup step using `actions/setup-node@v4` in `.github/workflows/release.yml`
- [x] T029 [US2] Add Rust toolchain setup using `dtolnay/rust-toolchain@stable` in `.github/workflows/release.yml`
- [x] T030 [US2] Add macOS cross-compilation targets in `.github/workflows/release.yml`
- [x] T031 [US2] Add Linux dependency installation step in `.github/workflows/release.yml`
- [x] T032 [US2] Add frontend dependency installation step in `.github/workflows/release.yml`
- [x] T033 [US2] Add Tauri build step using `tauri-apps/tauri-action@v1` with release configuration in `.github/workflows/release.yml`
- [x] T034 [US2] Configure release settings: `tagName: v__VERSION__`, `releaseName: 'Version __VERSION__'` in `.github/workflows/release.yml`
- [x] T035 [US2] Configure `releaseDraft: true` and `prerelease: false` in `.github/workflows/release.yml`
- [x] T036 [US2] Configure `releaseBody` with default release notes in `.github/workflows/release.yml`
- [x] T037 [US2] Configure `uploadUpdaterJson: true` for in-app update support in `.github/workflows/release.yml`
- [x] T038 [US2] Add platform-specific args to matrix (aarch64-apple-darwin, x86_64-apple-darwin, empty for Linux/Windows) in `.github/workflows/release.yml`

### Verification for User Story 2

> **NOTE**: Tasks T039-T047 require manual verification after pushing to GitHub.

- [ ] T039 [US2] Create test tag `v0.0.1-test` and push to trigger release workflow (MANUAL)
- [ ] T040 [US2] Verify all 4 platform builds start in GitHub Actions tab (MANUAL)
- [ ] T041 [US2] Wait for builds to complete and verify GitHub release is created as draft (MANUAL)
- [ ] T042 [US2] Verify release contains .dmg installers for both macOS ARM64 and x86_64 (MANUAL)
- [ ] T043 [US2] Verify release contains .AppImage and .deb packages for Linux (MANUAL)
- [ ] T044 [US2] Verify release contains .exe and .msi installers for Windows (MANUAL)
- [ ] T045 [US2] Verify latest-updater.json is generated and attached to release (MANUAL)
- [ ] T046 [US2] Download and test at least one installer per platform group (optional but recommended) (MANUAL)
- [ ] T047 [US2] Delete test release and local tag after verification: `git tag -d v0.0.1-test` (MANUAL)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - validation runs on pushes/PRs, releases run on tags

---

## Phase 5: User Story 3 - Updater Configuration (Priority: P2)

**Goal**: Application automatically detects and downloads updates when new versions are released

**Independent Test**: Install a version, create a new release, and verify the application detects and offers the update

> **NOTE**: This user story is primarily handled automatically by the Tauri action. The tasks focus on verification.

### Implementation for User Story 3

- [x] T048 [US3] Verify `tauri.conf.json` has updater configuration pointing to GitHub releases - added to plugins.updater
- [x] T049 [US3] Verify updater endpoints in `tauri.conf.json` use correct repository URL format - added placeholder <OWNER>/<REPO>
- [x] T050 [US3] Verify `package.json` or `Cargo.toml` has correct repository URL for updater - repository URL uses default from GitHub

### Verification for User Story 3

> **NOTE**: Tasks T051-T057 require manual verification with built application and GitHub releases.

- [ ] T051 [US3] Build and install current version of application locally (MANUAL)
- [ ] T052 [US3] Create new release tag (e.g., `v0.0.2-test-updater`) to trigger release workflow (MANUAL)
- [ ] T053 [US3] Wait for release to complete and verify latest-updater.json is correct (MANUAL)
- [ ] T054 [US3] Launch installed application and verify it detects the new version (MANUAL)
- [ ] T055 [US3] Trigger update download and verify correct platform installer is downloaded (MANUAL)
- [ ] T056 [US3] Verify update installs successfully and application restarts with new version (MANUAL)
- [ ] T057 [US3] Clean up: delete test release and local tags (MANUAL)

**Checkpoint**: All user stories should now be independently functional - automated validation, automated releases, and working updater

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and documentation

- [x] T058 [P] Update `docs-ai/PROGRESS.md` with feature implementation summary
- [x] T059 [P] Update `docs-ai/STATUS.md` if technology stack changed (GitHub Actions added) - already present in CLAUDE.md
- [x] T060 [P] Add workflow files to any existing documentation that references build/release processes - quickstart.md covers this
- [x] T061 [P] Consider adding dependency caching for faster builds (actions/cache@v4) - documented as future enhancement in PROGRESS.md
- [x] T062 [P] Verify quickstart.md instructions are accurate and complete - verified, covers all workflows

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - light foundational checks
- **User Stories (Phase 3-5)**: Can proceed in parallel after Setup
  - **US1 (Build Validation)**: Independent - no dependencies on other stories
  - **US2 (Release)**: Independent - no dependencies on US1
  - **US3 (Updater)**: Depends on US2 (needs a release to test against)
- **Polish (Phase 6)**: Depends on US1 and US2 being complete

### User Story Dependencies

- **User Story 1 (Build Validation)**: Fully independent - can be completed alone for basic CI
- **User Story 2 (Release)**: Fully independent - can be completed alone for CD
- **User Story 3 (Updater)**: Requires US2 for testing (needs a release with updater.json)

### Within Each User Story

- US1: T007-T018 are sequential (building up the workflow file)
- US2: T023-T038 are sequential (building up the workflow file)
- US3: T048-T050 are verification tasks that can run in parallel

### Parallel Opportunities

- **US1 and US2 workflows** can be created in parallel by different developers
- **T004, T005, T006** (Foundational) can run in parallel
- **T048, T049, T050** (US3 implementation) can run in parallel
- **T058, T059, T060, T061, T062** (Polish) can run in parallel

---

## Parallel Example: User Story 1 & 2

Since US1 and US2 are independent, they can be worked on in parallel:

```bash
# Developer A: Build Validation Workflow
Task: "T007 [US1] Create .github/workflows/build-validation.yml with workflow name and basic structure"
Task: "T008 [US1] Add trigger configuration..."
# ... continue through T022

# Developer B: Release Workflow (simultaneously)
Task: "T023 [P] [US2] Create .github/workflows/release.yml with workflow name and basic structure"
Task: "T024 [US2] Add trigger configuration..."
# ... continue through T047
```

---

## Implementation Strategy

### MVP First (User Story 1 Only - CI)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (light checks)
3. Complete Phase 3: User Story 1 (Build Validation)
4. **STOP and VALIDATE**: Push to master, create PR, verify validation runs
5. You now have automated build validation

### Incremental Delivery

1. Add User Story 2 (Release) → Test with tag → You have CI + CD
2. Add User Story 3 (Updater) → Test with actual installer → Full feature

### Full Feature Delivery

1. Complete Setup + Foundational → Ready for workflows
2. Add US1 (Build Validation) → Test independently → CI working
3. Add US2 (Release) → Test independently → CD working
4. Add US3 (Updater) → Test with real release → Full feature complete
5. Polish documentation

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Tasks** | 62 |
| **Setup** | 3 |
| **Foundational** | 3 |
| **User Story 1 (Build Validation)** | 16 |
| **User Story 2 (Release)** | 25 |
| **User Story 3 (Updater)** | 10 |
| **Polish** | 5 |
| **Parallelizable Tasks** | 12 |

**MVP Scope** (User Story 1 only): 22 tasks (Setup + Foundational + US1)
**Full Feature**: All 62 tasks

---

## Notes

- [P] tasks = different files or truly independent operations
- [Story] label maps task to specific user story for traceability
- US1 and US2 are fully independent and can be developed in parallel
- US3 requires US2 to be complete for testing
- Verification tasks (manual testing) are essential for CI/CD features
- Commit after each task or logical group
- Use test tags (v0.0.1-test) for initial verification
- Delete test releases after verification to keep repository clean
