# Contributing to LocalShare

Thank you for your interest in contributing to **LocalShare**! We welcome contributions from developers, technical writers, and designers of all experience levels.

Whether you are fixing a typo in documentation, squashing a bug, or proposing a major feature, your help is appreciated.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior to [contact@localshare.app](mailto:contact@localshare.app).

---

## How Can You Contribute?

* **Report Bugs**: Help us identify defects by submitting detailed [bug reports](.github/ISSUE_TEMPLATE/bug_report.md).
* **Suggest Enhancements**: Share ideas for new features or UX improvements via [feature requests](.github/ISSUE_TEMPLATE/feature_request.md).
* **Improve Documentation**: Enhance setup guides, write tutorials, or fix inaccuracies in `README.md` or `docs/`.
* **Fix Issues**: Pick up open issues labeled `good first issue` or `help wanted` on GitHub.
* **Write Tests**: Expand test coverage for core server streaming, security, or UI components.

---

## Development Environment Setup

### Prerequisites
* **Node.js**: Version 18.x or 20.x LTS ([Download Node.js](https://nodejs.org/))
* **npm**: Version 9.x or higher
* **Git**: Installed and configured on your machine

### 1. Fork & Clone
1. Fork the repository on GitHub: [https://github.com/Rahul0070050/localshare](https://github.com/Rahul0070050/localshare)
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/localshare.git
   cd localshare
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/Rahul0070050/localshare.git
   git fetch upstream
   ```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build Project Artifacts
Verify that all compilation targets succeed:
```bash
npm run build
```

### 4. Run Development Servers
For development with hot reloading:
```bash
# Terminal 1: Run Next.js desktop renderer on port 3456
npm run dev:renderer

# Terminal 2: Run TypeScript compiler in watch mode
npm run dev:electron

# Terminal 3: Start Electron
npm start
```

---

## Git Workflow & Conventions

### Branch Naming Conventions
Create a descriptive branch for your work:
```bash
git checkout -b <type>/<short-description>
```

Recommended prefixes:
* `feat/` for new features (e.g., `feat/upload-endpoint`)
* `fix/` for bug fixes (e.g., `fix/mkv-mime-type`)
* `docs/` for documentation updates (e.g., `docs/install-guide`)
* `refactor/` for code refactoring with no behavior change
* `test/` for adding or updating tests

### Commit Message Conventions
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <short imperative description>

[optional body]

[optional issue reference, e.g. Fixes #42]
```

**Examples:**
* `feat(client): add playback speed toggle to video player`
* `fix(server): resolve path traversal edge case in folder validator`
* `docs(readme): update quickstart instructions and badges`
* `refactor(electron): streamline IPC event listeners`

---

## Code Quality & Testing

### Code Style
* Use **TypeScript** with explicit types where practical.
* Avoid using `any` unless strictly necessary (e.g. legacy external interfaces).
* Format code cleanly using 2 spaces for indentation.
* Preserve separation of concerns between `server/core/` (Node.js engine), `server/desktop/` (Next.js GUI), and `client/` (Preact web client).

### Running Tests
Run the automated test suite before opening a pull request:

```bash
# Compile and run server unit tests
npm test

# Run integration tests
npm run test:integration
```

---

## Submitting a Pull Request (PR)

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
2. **Push to your fork**:
   ```bash
   git push origin <your-branch-name>
   ```
3. **Open a Pull Request**:
   * Navigate to the [LocalShare GitHub repository](https://github.com/Rahul0070050/localshare).
   * Click **New Pull Request** and select your branch.
   * Fill out the provided [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).

### PR Review Checklist
Before submitting, please ensure:
- [ ] Your code builds cleanly with `npm run build`.
- [ ] Automated tests pass (`npm test`).
- [ ] You have linked any related issues (e.g., `Fixes #12`).
- [ ] Documentation has been updated if user-facing behavior changed.
- [ ] Commit history is clean and follows conventional commit format.

---

## Questions and Support

* **Bug Reports & Feature Ideas**: Open an issue on [GitHub Issues](https://github.com/Rahul0070050/localshare/issues).
* **Security Concerns**: Review [SECURITY.md](SECURITY.md) and email [contact@localshare.app](mailto:contact@localshare.app).
* **General Discussions**: Open a thread in [GitHub Discussions](https://github.com/Rahul0070050/localshare/discussions).
