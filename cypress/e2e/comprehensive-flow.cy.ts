describe('Comprehensive Application Flow', () => {
  it('should complete full user journey from public to admin', () => {
    // 1. Visit public homepage
    cy.visit('/');
    cy.get('h1').should('contain', 'Referral Categories');
    cy.get('mat-card').should('have.length.greaterThan', 0);

    // 2. Navigate to a category
    cy.get('mat-card').first().click();
    cy.url().should('include', '/category/');
    cy.get('app-referral-card').should('exist');

    // 3. Interact with an offer
    cy.get('app-referral-card').first().within(() => {
      cy.get('button[aria-label*="Copy"]').click();
    });

    // 4. Navigate back to home
    cy.get('.back-button').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // 5. Access admin area
    cy.visit('/admin');
    cy.url().should('include', '/admin/login');

    // 6. Login as admin
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin/dashboard');

    // 7. Navigate to category management
    cy.get('a[href*="categories"], button').contains('Categories').click();
    cy.url().should('include', '/admin/categories');
    cy.get('mat-table').should('exist');

    // 8. Create a new category
    cy.get('button').contains('Add Category').click();
    cy.get('input[formControlName="name"]').type('E2E Test Category');
    cy.get('textarea[formControlName="description"]').type('Created during E2E testing');
    cy.get('mat-select[formControlName="icon"]').click();
    cy.get('mat-option').first().click();
    cy.get('button[type="submit"]').click();
    cy.get('mat-snack-bar-container').should('contain', 'Category created successfully');

    // 9. Navigate to offer management
    cy.get('a[href*="offers"], button').contains('Offers').click();
    cy.url().should('include', '/admin/offers');

    // 10. Create a new offer
    cy.get('button').contains('Add Offer').click();
    cy.get('input[formControlName="title"]').type('E2E Test Offer');
    cy.get('textarea[formControlName="description"]').type('Created during E2E testing');
    cy.get('input[formControlName="referralLink"]').type('https://example.com/e2e-test');
    cy.get('input[formControlName="referralCode"]').type('E2ETEST123');
    cy.get('mat-select[formControlName="categoryId"]').click();
    cy.get('mat-option').first().click();
    cy.get('button[type="submit"]').click();
    cy.get('mat-snack-bar-container').should('contain', 'Offer created successfully');

    // 11. Navigate to utilities
    cy.get('a[href*="utilities"], button').contains('Utilities').click();
    cy.url().should('include', '/admin/utilities');
    cy.get('mat-tab-group').should('exist');

    // 12. Test link validation
    cy.get('mat-tab').contains('Link Validation').click();
    cy.get('textarea[formControlName="urls"]').type('https://example.com');
    cy.get('button').contains('Validate Links').click();
    cy.get('.validation-results').should('be.visible');

    // 13. Test code generation
    cy.get('mat-tab').contains('Code Generation').click();
    cy.get('input[formControlName="count"]').clear().type('3');
    cy.get('button').contains('Generate Codes').click();
    cy.get('.generated-codes').should('be.visible');
    cy.get('.code-item').should('have.length', 3);

    // 14. Logout
    cy.get('button').contains('Logout').click();
    cy.url().should('include', '/admin/login');

    // 15. Verify public site still works
    cy.visit('/');
    cy.get('h1').should('contain', 'Referral Categories');
    
    // 16. Check accessibility throughout
    cy.injectAxe();
    cy.checkA11y();
  });

  it('should handle error scenarios gracefully', () => {
    // Test 404 page
    cy.visit('/non-existent-page', { failOnStatusCode: false });
    cy.get('body').should('contain', '404');

    // Test admin access without login
    cy.visit('/admin/categories', { failOnStatusCode: false });
    cy.url().should('include', '/admin/login');

    // Test invalid login
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.get('mat-error, .error-message').should('be.visible');
  });

  it('should be responsive across different viewports', () => {
    const viewports = [
      { width: 320, height: 568 }, // iPhone SE
      { width: 768, height: 1024 }, // iPad
      { width: 1024, height: 768 }, // iPad Landscape
      { width: 1920, height: 1080 } // Desktop
    ];

    viewports.forEach((viewport) => {
      cy.viewport(viewport.width, viewport.height);
      
      // Test public homepage
      cy.visit('/');
      cy.get('mat-card').should('be.visible');
      
      // Test category page
      cy.get('mat-card').first().click();
      cy.get('app-referral-card').should('be.visible');
      cy.get('.back-button').click();
      
      // Test admin login
      cy.visit('/admin/login');
      cy.get('form').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
    });
  });

  it('should maintain performance standards', () => {
    // Test page load times
    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.performance.mark('start');
      },
      onLoad: (win) => {
        win.performance.mark('end');
        win.performance.measure('pageLoad', 'start', 'end');
        const measure = win.performance.getEntriesByName('pageLoad')[0];
        expect(measure.duration).to.be.lessThan(3000); // 3 seconds
      }
    });

    // Test navigation performance
    cy.get('mat-card').first().click();
    cy.get('app-referral-card').should('be.visible');
    
    // Ensure no memory leaks by checking for excessive DOM nodes
    cy.get('*').should('have.length.lessThan', 1000);
  });
});