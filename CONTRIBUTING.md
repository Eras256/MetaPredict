# Contributing to MetaPredict.ai

Thank you for your interest in contributing to MetaPredict.ai! 🎉

This guide will help you understand how you can contribute to the project effectively.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Process](#development-process)
- [Code Standards](#code-standards)
- [Reporting Issues](#reporting-issues)
- [Pull Requests](#pull-requests)
- [License](#license)

## 📜 Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to project maintainers.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug:

1. **Check if it's already reported**: Search [existing issues](https://github.com/Vaios0x/MetaPredict/issues)
2. **Create a new issue**: If it doesn't exist, create one with:
   - Clear and descriptive title
   - Detailed description of the problem
   - Steps to reproduce
   - Expected vs. actual behavior
   - Environment information (OS, Node version, etc.)
   - Screenshots if applicable

### Suggesting Enhancements

Suggestions for new features are welcome:

1. **Open an issue** with the `enhancement` label
2. **Clearly describe**:
   - The problem it solves
   - The proposed solution
   - Alternatives considered
   - Impact on the project

### Contributing Code

1. **Fork the repository**
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following the [code standards](#code-standards)
4. **Write or update tests** if necessary
5. **Ensure all tests pass**:
   ```bash
   pnpm test:all
   ```
6. **Commit your changes** with descriptive messages
7. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Open a Pull Request** on GitHub

## 🔄 Development Process

### Project Structure

```
MetaPredict/
├── smart-contracts/    # Smart contracts (Solidity)
├── backend/           # API and backend services (TypeScript)
├── frontend/          # Frontend application (Next.js)
└── docs/              # Documentation
```

### Environment Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Vaios0x/MetaPredict.git
   cd MetaPredict
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configurations
   ```

4. **Run tests**:
   ```bash
   pnpm test:all
   ```

## 📝 Code Standards

### TypeScript/JavaScript

- ✅ Use TypeScript for all new code
- ✅ Follow configured ESLint rules
- ✅ Use descriptive names for variables and functions
- ✅ Comment complex code
- ✅ Keep functions small and focused

### Solidity

- ✅ Follow the [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- ✅ Use `require()` with descriptive messages
- ✅ Implement checks-effects-interactions pattern
- ✅ Document public functions with NatSpec
- ✅ Consider gas optimization

### Commits

Use descriptive commit messages following [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add support for new market types
fix: fix bug in fee calculation
docs: update API documentation
test: add tests for insurance pool
refactor: improve service structure
```

### Tests

- ✅ Write tests for all new functionality
- ✅ Maintain test coverage > 90%
- ✅ Use descriptive names for tests
- ✅ Group related tests

## 🐛 Reporting Issues

### Security Issues

**DO NOT** report security vulnerabilities in public issues. See our [Security Policy](./SECURITY.md).

### Other Issues

Use the appropriate issue template:
- 🐛 **Bug Report**: To report errors
- 💡 **Feature Request**: To suggest new features
- 📚 **Documentation**: For documentation improvements
- ❓ **Question**: For general questions

## 🔀 Pull Requests

### Before Submitting

- ✅ All tests pass (`pnpm test:all`)
- ✅ Code follows project standards
- ✅ Documentation is updated
- ✅ Commits are well formatted
- ✅ No conflicts with `main`

### Review Process

1. **A maintainer will review** your PR
2. **There may be feedback** you need to address
3. **Once approved**, it will be merged to `main`
4. **You will be notified** when completed

### PR Checklist

- [ ] Code follows project standards
- [ ] Tests have been added for new changes
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Commits are well formatted
- [ ] No conflicts with base branch

## 📚 Documentation

- ✅ Update documentation when adding new features
- ✅ Include usage examples when appropriate
- ✅ Keep README.md updated
- ✅ Document breaking changes in CHANGELOG.md

## 🏷️ Issue Labels

We use labels to organize issues:

- `bug`: Something isn't working
- `enhancement`: New feature or improvement
- `documentation`: Documentation improvements
- `question`: Question that needs an answer
- `help wanted`: Extra help is welcome
- `good first issue`: Good for new contributors
- `priority: high`: High priority
- `priority: low`: Low priority

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

## 🙏 Acknowledgments

Thank you for contributing to MetaPredict.ai! Your help makes this project better for everyone.

---

**Last updated**: December 2025  
**Based on**: [GitHub Contributing Guidelines](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors)
