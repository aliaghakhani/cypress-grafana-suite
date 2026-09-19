describe('Cypress Automation Demo on UI Testing Playground', () => {

  beforeEach(() => {
    cy.visit('http://uitestingplayground.com');
  });

  it('1. Should handle text input and update dynamic UI state', () => {
    cy.contains('Text Input').click();

    const customText = 'LinkedIn Showcase';
    cy.get('#newButtonName').type(customText);
    
    cy.get('#updatingButton').click();

    cy.get('#updatingButton')
      .should('be.visible')
      .and('have.text', customText);
  });

  it('2. Should click elements with changing, dynamic IDs safely', () => {
    cy.contains('Dynamic ID').click();

    cy.contains('button', 'Button with Dynamic ID')
      .should('be.visible')
      .click();
  });

  it('3. Should handle client-side delays and AJAX data injection', () => {
    cy.contains('AJAX Data').click();

    cy.get('#ajaxButton').click();

    cy.get('.bg-success', { timeout: 20000 })
      .should('be.visible')
      .and('contain', 'Data loaded');
  });

  it('4. Should find and click a specific element hidden within a scrolling container', () => {
    cy.contains('Scrollbars').click();

    cy.get('#hidingButton')
      .scrollIntoView()
      .should('be.visible')
      .click();
  });
});
