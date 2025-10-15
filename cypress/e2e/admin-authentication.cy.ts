describe('Admin Authentication', () => {
  beforeEach(() => {
    // Clear any existing auth state
    cy.clearLocalStorage();
    cy.visit('/admin');
  });

  it('should redirect to login page when accessing admin without authentication', () => {
    cy.url().should('include', '/admin/login');
    cy.get('h1').should('contain', 'Admin Login');
  });

  it('should display login form with required fields', () => {
    cy.get('form').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
    cy.get('button[type="submit"]').should('contain', 'Login');
  });

  it('should show validation error for empty password', () => {
    cy.get('button[type="submit"]').click();
    cy.get('mat-error').should('be.visible');
    cy.get('mat-error').should('contain', 'Password is required');
  });

  it('should show error for incorrect password', () => {
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.get('mat-error, .error-message').should('contain', 'Invalid password');
  });

  it('should login successfully with correct password', () => {
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin/dashboard');
    cy.get('h1').should('contain', 'Admin Dashboard');
  });

  it('should maintain authentication state after page refresh', () => {
    // Login first
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin/dashboard');
    
    // Refresh page
    cy.reload();
    cy.url().should('include', '/admin/dashboard');
  });

  it('should logout and redirect to login page', () => {
    // Login first
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Logout
    cy.get('button').contains('Logout').click();
    cy.url().should('include', '/admin/login');
  });

  it('should prevent access to admin routes after logout', () => {
    // Login first
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Logout
    cy.get('button').contains('Logout').click();
    
    // Try to access admin route directly
    cy.visit('/admin/categories');
    cy.url().should('include', '/admin/login');
  });

  it('should handle session timeout', () => {
    // Login first
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Simulate session timeout by clearing localStorage
    cy.clearLocalStorage();
    cy.visit('/admin/categories');
    cy.url().should('include', '/admin/login');
  });

  it('should show/hide password when toggle is clicked', () => {
    cy.get('input[type="password"]').should('have.attr', 'type', 'password');
    cy.get('button[aria-label*="toggle"], .password-toggle').click();
    cy.get('input[type="text"]').should('exist');
  });

  it('should handle keyboard navigation in login form', () => {
    cy.get('input[type="password"]').focus();
    cy.focused().type('admin123');
    cy.focused().type('{enter}');
    cy.url().should('include', '/admin/dashboard');
  });

  it('should be accessible', () => {
    cy.injectAxe();
    cy.checkA11y();
  });

  it('should display proper error states', () => {
    cy.get('input[type="password"]').type('wrong');
    cy.get('button[type="submit"]').click();
    cy.get('input[type="password"]').should('have.class', 'ng-invalid');
  });

  it('should clear form on successful login', () => {
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.visit('/admin/login');
    cy.get('input[type="password"]').should('have.value', '');
  });
});