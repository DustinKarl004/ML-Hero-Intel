# Contributing to ML Hero Intel

Thank you for your interest in contributing to ML Hero Intel! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Pull Requests](#pull-requests)
- [Development Workflow](#development-workflow)
- [Style Guidelines](#style-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

Our project is committed to providing a welcoming and inclusive environment for everyone. We expect all contributors to adhere to our Code of Conduct, which includes:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## Getting Started

1. **Fork the repository**:
   Click the "Fork" button at the top right of the [ML Hero Intel repository](https://github.com/yourusername/ml-hero-intel).

2. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/ml-hero-intel.git
   cd ml-hero-intel
   ```

3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/originalowner/ml-hero-intel.git
   ```

4. **Install dependencies**:
   ```bash
   # Frontend dependencies
   cd frontend
   npm install
   
   # Backend dependencies
   cd ../backend
   npm install
   ```

5. **Set up environment variables**:
   - Copy `.env.example` to `.env.local` in both frontend and backend directories
   - Fill in the required environment variables

6. **Start the development servers**:
   ```bash
   # Frontend
   cd frontend
   npm run dev
   
   # Backend (in a separate terminal)
   cd backend
   npm run dev
   ```

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue in our GitHub repository with the following information:

- A clear title and description
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment information (browser, OS, etc.)

Use the "Bug Report" issue template when creating your issue.

### Suggesting Features

We welcome feature suggestions! Please use the "Feature Request" issue template and include:

- A clear title and description
- Why this feature would be beneficial
- Any implementation ideas you have
- Mockups or diagrams (if applicable)

### Pull Requests

1. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Write clear, concise code
   - Follow the style guidelines
   - Add tests for your changes
   - Update documentation as needed

3. **Commit your changes**:
   ```bash
   git commit -m "feat: add your feature description"
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a pull request**:
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your branch and submit
   - Fill out the PR template completely

6. **Address review feedback**:
   - Respond to reviewer comments
   - Make requested changes
   - Push additional commits to your branch

## Development Workflow

1. **Keep your fork updated**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   git push origin main
   ```

2. **Create feature branches from main**:
   ```bash
   git checkout main
   git pull
   git checkout -b feature/your-feature
   ```

3. **Rebase before submitting PRs**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

4. **Resolve conflicts during rebase**:
   If conflicts occur, resolve them, then continue:
   ```bash
   git add .
   git rebase --continue
   ```

## Style Guidelines

### JavaScript/TypeScript

- We follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use TypeScript for type safety
- Use ESLint and Prettier for code formatting

### React

- Use functional components with hooks
- Organize components by feature or page
- Keep components small and focused
- Use CSS modules or styled-components for styling

### CSS

- Use Tailwind CSS utility classes
- Follow a mobile-first approach
- Use semantic class names when custom classes are needed

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types include:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or fixing tests
- `chore`: Changes to the build process or auxiliary tools

Example:
```
feat(auth): add email verification

Implement email verification after signup to improve security.

Closes #123
```

## Testing

- Write tests for new features and bug fixes
- Run tests locally before submitting a PR
- Ensure all tests pass

Frontend tests:
```bash
cd frontend
npm test
```

Backend tests:
```bash
cd backend
npm test
```

## Documentation

- Update README.md with new features or changes
- Document new components, functions, and APIs
- Add comments to complex code sections
- Update deployment documentation when necessary

## Community

- Join our [Discord server](https://discord.gg/mlherointel) to connect with other contributors
- Participate in discussions on GitHub issues
- Help answer questions from new contributors
- Share your work and ideas

---

Thank you for contributing to ML Hero Intel! Your efforts help make this project better for everyone. 