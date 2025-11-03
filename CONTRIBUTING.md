# Contributing to Business Central Time Tracker

Thank you for considering contributing to this project! We welcome contributions from the community.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/zendesk-bc-timetracker.git
   cd zendesk-bc-timetracker
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running Locally

1. Start the Webpack dev server (with watch mode):
   ```bash
   npm run dev
   ```

2. In another terminal, start the ZCLI server:
   ```bash
   npm run server
   ```

3. Test in Zendesk:
   - Navigate to a ticket with `?zcli_apps=true` in the URL
   - Example: `https://yoursubdomain.zendesk.com/agent/tickets/123?zcli_apps=true`

### Code Style

- Use functional React components with hooks (no class components)
- Follow ES6+ syntax
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused

### File Organization

- **Components**: Place UI components in `src/components/`
- **Services**: Place API services in `src/services/`
- **Utils**: Place utility functions in `src/utils/`
- **Styles**: Keep CSS in `src/styles.css`

### Testing

Before submitting:

1. Test the build process:
   ```bash
   npm run build
   ```

2. Verify the package can be created:
   ```bash
   npm run package
   ```

3. Test in a live Zendesk environment
4. Test with actual Business Central API (if possible)

### Manual Testing Checklist

- [ ] App loads without errors
- [ ] Client dropdown works
- [ ] Project dropdown works
- [ ] Time input validation works
- [ ] Description field works
- [ ] Save functionality works
- [ ] Error handling displays properly
- [ ] Success messages display properly
- [ ] Form clears after save
- [ ] No console errors

## Submitting Changes

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: Add your feature description"
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub:
   - Provide a clear title and description
   - Reference any related issues
   - Include screenshots if UI changes
   - List what you tested

### Commit Message Format

Use conventional commits format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Examples:
```
feat: Add date picker for backdating entries
fix: Correct employee lookup by email
docs: Update installation instructions
refactor: Simplify time entry validation
```

## Feature Requests

Have an idea for a new feature? Great!

1. **Check existing issues** to see if it's already requested
2. **Open a new issue** with:
   - Clear description of the feature
   - Use case / motivation
   - Proposed implementation (if you have ideas)
   - Screenshots/mockups (if applicable)

## Bug Reports

Found a bug? Please help us fix it!

1. **Check existing issues** to see if it's already reported
2. **Open a new issue** with:
   - Clear description of the bug
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Environment details (browser, Zendesk version, etc.)

## Architecture Notes

### Service Layer

- `businessCentralService.js`: Handles all BC API calls
- `zendeskService.js`: Handles all ZAF Client API calls
- Services are singletons initialized on app start

### State Management

- Uses React hooks (`useState`, `useEffect`)
- No external state management library (Redux, etc.)
- State is managed in the main `App.jsx` component

### API Authentication

- Currently uses Basic Auth with credentials in app settings
- Future: Could add OAuth 2.0 support

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on what's best for the project

## Questions?

If you have questions:
- Open a GitHub issue
- Check the README.md
- Contact: support@knowall.ai

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing!
