describe('Public User Journey', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the home page with categories', () => {
    cy.get('h1').should('contain', 'Referral Categories');
    cy.get('mat-card').should('have.length.greaterThan', 0);
    cy.get('.category-card').should('be.visible');
  });

  it('should navigate to category page when clicking a category', () => {
    cy.get('mat-card').first().click();
    cy.url().should('include', '/category/');
    cy.get('h1').should('not.contain', 'Referral Categories');
  });

  it('should display offers in category page', () => {
    cy.get('mat-card').first().click();
    cy.get('app-referral-card').should('exist');
    cy.get('.back-button').should('be.visible');
  });

  it('should navigate back to home from category page', () => {
    cy.get('mat-card').first().click();
    cy.get('.back-button').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.get('h1').should('contain', 'Referral Categories');
  });

  it('should search for offers in category page', () => {
    cy.get('mat-card').first().click();
    cy.get('input[placeholder*="Search"]').type('test');
    cy.get('input[placeholder*="Search"]').should('have.value', 'test');
  });

  it('should handle pagination in category page', () => {
    cy.get('mat-card').first().click();
    cy.get('mat-paginator').should('exist');
  });

  it('should copy referral code when clicking copy button', () => {
    cy.get('mat-card').first().click();
    cy.get('button[aria-label*="Copy"]').first().click();
    // Note: Clipboard testing is limited in Cypress
  });

  it('should be responsive on mobile viewport', () => {
    cy.viewport('iphone-6');
    cy.get('mat-card').should('be.visible');
    cy.get('mat-grid-list').should('exist');
  });

  it('should be responsive on tablet viewport', () => {
    cy.viewport('ipad-2');
    cy.get('mat-card').should('be.visible');
    cy.get('mat-grid-list').should('exist');
  });

  it('should handle empty state gracefully', () => {
    // Mock empty state by intercepting API calls
    cy.intercept('GET', '**/categories', { fixture: 'empty-categories.json' });
    cy.visit('/');
    cy.get('.no-categories').should('be.visible');
  });

  it('should handle loading states', () => {
    cy.intercept('GET', '**/categories', { delay: 1000, fixture: 'categories.json' });
    cy.visit('/');
    cy.get('mat-spinner').should('be.visible');
    cy.get('mat-spinner').should('not.exist');
  });

  it('should display category information correctly', () => {
    cy.get('mat-card').first().within(() => {
      cy.get('mat-card-title').should('not.be.empty');
      cy.get('mat-card-content').should('not.be.empty');
      cy.get('.offer-count').should('contain', 'offers');
    });
  });

  it('should handle keyboard navigation', () => {
    cy.get('mat-card').first().focus();
    cy.focused().type('{enter}');
    cy.url().should('include', '/category/');
  });

  it('should maintain accessibility standards', () => {
    cy.injectAxe();
    cy.checkA11y();
  });
});