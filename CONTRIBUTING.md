# Contributing to Respond.io MCP Server

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Project Structure](#project-structure)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards others

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Git
- A Respond.io account for testing
- Basic understanding of TypeScript and MCP protocol

### Finding Issues to Work On

1. Check the [Issues](https://github.com/respond-io/mcp-server/issues) page
2. Look for issues tagged with `good first issue` or `help wanted`
3. Comment on the issue to let others know you're working on it
4. If you have a new feature idea, open an issue first to discuss it

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/respond-io/mcp-server.git
cd mcp-server

# Add upstream remote
git remote add upstream https://github.com/respond-io/mcp-server.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

```bash
cp .env.example .env
# Edit .env and add your test API key
```

### 4. Build the Project

```bash
npm run build
```

### 5. Run in Development Mode

```bash
npm run dev
```

## Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Update documentation as needed

### 3. Test Your Changes

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format

# Build
npm run build
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build process or auxiliary tool changes

## Coding Standards

### TypeScript Guidelines

1. **Use TypeScript strict mode**
   - All code must pass strict type checking
   - Avoid `any` types when possible
   - Use proper type annotations

2. **Follow naming conventions**
   - `camelCase` for variables and functions
   - `PascalCase` for classes and types
   - `UPPER_SNAKE_CASE` for constants
   - Prefix interfaces with `I` if needed for clarity

4. **Use the `Tool` interface for creating new tools**
   - All tools should implement the `Tool` interface to ensure consistency.

3. **Write self-documenting code**
   - Use descriptive variable and function names
   - Add JSDoc comments for public APIs
   - Keep functions small and focused

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check linting
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Example Code

```typescript
/**
 * Validates a contact identifier
 * @param identifier - Contact identifier string
 * @returns Validation result with errors if any
 */
export function validateIdentifier(identifier: string): ValidationResult {
  const errors: string[] = [];

  if (!identifier) {
    errors.push("Identifier is required");
    return { valid: false, errors };
  }

  const isValid =
    REGEX_PATTERNS.IDENTIFIER_ID.test(identifier) ||
    REGEX_PATTERNS.IDENTIFIER_EMAIL.test(identifier) ||
    REGEX_PATTERNS.IDENTIFIER_PHONE.test(identifier);

  if (!isValid) {
    errors.push(ERROR_MESSAGES.INVALID_IDENTIFIER);
  }

  return { valid: errors.length === 0, errors };
}
```

## Testing

### Manual Testing

1. Build the project: `npm run build`
2. Configure Claude Desktop with your local build
3. Test all modified functionality
4. Verify error handling works correctly

### Test Checklist

Before submitting:
- [ ] All TypeScript compiles without errors
- [ ] ESLint passes without warnings
- [ ] Code is properly formatted with Prettier
- [ ] All new functions have proper type annotations
- [ ] Error handling is implemented
- [ ] Documentation is updated

## Submitting Changes

### 1. Update Your Branch

```bash
# Fetch latest changes from upstream
git fetch upstream
git rebase upstream/main
```

### 2. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 3. Create a Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template:

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

### 4. Address Review Comments

- Respond to all review comments
- Make requested changes
- Push updates to your branch (PR will update automatically)

## Project Structure

```
mcp-server/
├── src/
│   ├── index.ts           # Main server entry point
│   ├── types.ts           # Type definitions
│   ├── constants.ts       # Constants and enums
│   ├── utils/             # Utility functions
│   ├── middlewares/       # Express middlewares
│   └── tools/             # Tool definitions
├── dist/                  # Compiled JavaScript
├── .env.example           # Environment template
├── .eslintrc.json         # ESLint configuration
├── .prettierrc.json       # Prettier configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Project dependencies
└── README.md              # Project documentation
```

### Adding New Tools

When adding a new tool:

1. **Define the tool in `index.ts`**:
```typescript
{
  name: "your_tool_name",
  description: "Clear description of what it does",
  inputSchema: {
    type: "object",
    properties: {
      // Define parameters
    },
    required: ["param1"]
  }
}
```

2. **Add types in `types.ts`**:
```typescript
export interface YourToolArgs {
  param1: string;
  param2?: number;
}
```

3. **Add validation in `validators.ts`**:
```typescript
export function validateYourToolArgs(args: YourToolArgs): ValidationResult {
  // Validation logic
}
```

4. **Implement the handler**:
```typescript
const executeYourTool = async (name: string, args: YourToolArgs) => {
  // Implementation
};
```

5. **Update documentation** in README.md as needed

## Documentation

### When to Update Documentation

Update documentation when:
- Adding new features or tools
- Changing existing behavior
- Fixing bugs that affect usage
- Adding configuration options

### Documentation Files

- **README.md** – Overview, features, tool list, and usage examples
- **SETUP_GUIDE.md** – Detailed setup instructions
- **CONTRIBUTING.md** – This file
- Code comments – For complex logic

## Getting Help

If you need help:

1. Check existing documentation
2. Search closed issues
3. Ask in discussions
4. Open a new issue with the `question` label

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to Respond.io MCP Server! 🎉