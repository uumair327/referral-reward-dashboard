// ***********************************************
// Custom commands for Referral Reward Dashboard E2E tests
// ***********************************************

import 'cypress-axe';

// Admin login command
Cypress.Commands.add('loginAsAdmin', () => {
  cy.clearLocalStorage();
  cy.visit('/admin/login');
  cy.get('input[type="password"]').type('admin123');
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/admin/dashboard');
});

// Wait for Angular to be ready
Cypress.Commands.add('waitForAngular', () => {
  cy.window().then((win) => {
    return new Cypress.Promise((resolve) => {
      if (win.getAllAngularTestabilities) {
        const testabilities = win.getAllAngularTestabilities();
        if (testabilities.length === 0) {
          resolve(undefined);
          return;
        }
        
        let count = 0;
        testabilities.forEach((testability: any) => {
          testability.whenStable(() => {
            count++;
            if (count === testabilities.length) {
              resolve(undefined);
            }
          });
        });
      } else {
        resolve(undefined);
      }
    });
  });
});

// Custom command to check if element is in viewport
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const bottom = Cypress.$(cy.state('window')).height();
  const right = Cypress.$(cy.state('window')).width();
  const rect = subject[0].getBoundingClientRect();

  expect(rect.top).to.be.lessThan(bottom);
  expect(rect.bottom).to.be.greaterThan(0);
  expect(rect.right).to.be.greaterThan(0);
  expect(rect.left).to.be.lessThan(right);

  return subject;
});

// Custom command to wait for mat-spinner to disappear
Cypress.Commands.add('waitForSpinner', () => {
  cy.get('mat-spinner').should('not.exist');
});

// Custom command to check Material Design components
Cypress.Commands.add('checkMatComponent', (selector: string) => {
  cy.get(selector).should('exist').and('be.visible');
});

// Custom command to handle Material Select
Cypress.Commands.add('selectMatOption', (selectSelector: string, optionText: string) => {
  cy.get(selectSelector).click();
  cy.get('mat-option').contains(optionText).click();
});

// Custom command to check snackbar message
Cypress.Commands.add('checkSnackbar', (message: string) => {
  cy.get('mat-snack-bar-container').should('contain', message);
});

// Custom command to create test category
Cypress.Commands.add('createTestCategory', (name: string, description: string) => {
  cy.loginAsAdmin();
  cy.visit('/admin/categories');
  cy.get('button').contains('Add Category').click();
  cy.get('input[formControlName="name"]').type(name);
  cy.get('textarea[formControlName="description"]').type(description);
  cy.get('mat-select[formControlName="icon"]').click();
  cy.get('mat-option').first().click();
  cy.get('button[type="submit"]').click();
  cy.checkSnackbar('Category created successfully');
});

// Custom command to create test offer
Cypress.Commands.add('createTestOffer', (title: string, description: string, link: string, code: string) => {
  cy.loginAsAdmin();
  cy.visit('/admin/offers');
  cy.get('button').contains('Add Offer').click();
  cy.get('input[formControlName="title"]').type(title);
  cy.get('textarea[formControlName="description"]').type(description);
  cy.get('input[formControlName="referralLink"]').type(link);
  cy.get('input[formControlName="referralCode"]').type(code);
  cy.get('mat-select[formControlName="categoryId"]').click();
  cy.get('mat-option').first().click();
  cy.get('button[type="submit"]').click();
  cy.checkSnackbar('Offer created successfully');
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable<void>
      waitForAngular(): Chainable<void>
      isInViewport(): Chainable<JQuery<HTMLElement>>
      waitForSpinner(): Chainable<void>
      checkMatComponent(selector: string): Chainable<void>
      selectMatOption(selectSelector: string, optionText: string): Chainable<void>
      checkSnackbar(message: string): Chainable<void>
      createTestCategory(name: string, description: string): Chainable<void>
      createTestOffer(title: string, description: string, link: string, code: string): Chainable<void>
    }
  }
}
