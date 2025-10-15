# 🤝 Contributing to Referral & Rewards Dashboard

Thank you for your interest in contributing to the Referral & Rewards Dashboard! We welcome contributions from the community.

## 📋 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and constructive in all interactions.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Git
- Angular CLI 18+

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/yourusername/referral-reward-dashboard.git
   cd referral-reward-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Run tests**
   ```bash
   npm test          # Unit tests
   npm run e2e       # E2E tests
   ```

## 🔄 Development Workflow

### Branch Naming Convention
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `docs/description` - Documentation updates

### Commit Message Format
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(admin): add bulk offer management
fix(navigation): resolve mobile menu overlay issue
docs(readme): update installation instructions
test(services): add unit tests for validation service
```

## 🧪 Testing Guidelines

### Unit Tests
- Write tests for all new features
- Maintain 90%+ code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
describe('CategoryService', () => {
  it('should return active categories when getActiveCategories is called', () => {
    // Arrange
    const mockCategories = [/* test data */];
    
    // Act
    const result = service.getActiveCategories();
    
    // Assert
    expect(result).toEqual(expectedCategories);
  });
});
```

### E2E Tests
- Test critical user paths
- Include accessibility testing
- Test responsive behavior
- Use page object pattern

## 📝 Code Style Guidelines

### TypeScript/Angular
- Follow [Angular Style Guide](https://angular.io/guide/styleguide)
- Use strict TypeScript configuration
- Prefer interfaces over classes for data models
- Use OnPush change detection where possible

### SCSS
- Follow BEM methodology for CSS classes
- Use CSS custom properties for theming
- Mobile-first responsive design
- Prefer flexbox and grid for layouts

### Accessibility
- Follow WCAG 2.1 AA guidelines
- Include proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers

## 🎯 Areas for Contribution

### 🌟 High Priority
- [ ] Additional referral categories
- [ ] Enhanced search and filtering
- [ ] Performance optimizations
- [ ] Accessibility improvements
- [ ] Mobile UX enhancements

### 🔧 Medium Priority
- [ ] Dark mode implementation
- [ ] Internationalization (i18n)
- [ ] Advanced analytics
- [ ] Export/import functionality
- [ ] API integration

### 📚 Documentation
- [ ] Component documentation
- [ ] API documentation
- [ ] Tutorial videos
- [ ] Best practices guide

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description** - Clear description of the issue
2. **Steps to Reproduce** - Detailed steps
3. **Expected Behavior** - What should happen
4. **Actual Behavior** - What actually happens
5. **Environment** - Browser, OS, screen size
6. **Screenshots** - If applicable

**Bug Report Template:**
```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- Browser: Chrome 120
- OS: Windows 11
- Screen Size: 1920x1080
- Mobile: Yes/No

## Screenshots
[Attach screenshots if applicable]
```

## 💡 Feature Requests

For feature requests, please:

1. **Check existing issues** - Avoid duplicates
2. **Describe the problem** - What problem does this solve?
3. **Propose a solution** - How should it work?
4. **Consider alternatives** - Other ways to solve this?
5. **Additional context** - Screenshots, mockups, etc.

## 🔍 Pull Request Process

### Before Submitting
- [ ] Code follows style guidelines
- [ ] Tests pass (`npm test` and `npm run e2e`)
- [ ] Code is properly documented
- [ ] Accessibility requirements met
- [ ] Responsive design tested
- [ ] No console errors or warnings

### PR Checklist
- [ ] Descriptive title and description
- [ ] Links to related issues
- [ ] Screenshots for UI changes
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Changelog entry (if applicable)

### Review Process
1. **Automated checks** - CI/CD pipeline runs
2. **Code review** - Maintainer reviews code
3. **Testing** - Manual testing if needed
4. **Approval** - PR approved and merged

## 🏗️ Project Structure

```
src/
├── app/
│   ├── modules/
│   │   ├── public/          # Public interface
│   │   └── admin/           # Admin interface
│   ├── shared/              # Shared components
│   ├── services/            # Business logic
│   ├── models/              # Data models
│   └── app.config.ts        # App configuration
├── assets/                  # Static assets
├── environments/            # Environment configs
└── public/                  # PWA assets
```

## 📞 Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and ideas
- **Documentation** - Check README and wiki
- **Code Examples** - Look at existing components

## 🎉 Recognition

Contributors will be:
- Listed in the README contributors section
- Mentioned in release notes
- Invited to join the maintainers team (for significant contributions)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to make this project better! 🚀**