Cypress.Commands.add('antSelect', (selector, text) => {
  cy.get(`${selector}`).click();
  cy.get('.rc-virtual-list').contains(text).click();
});

describe('test main view', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    cy.visit('http://localhost:8082');
  });

  it('Project selector should be present', () => {
    cy.contains('Select Project...').should('exist');
  });

  it('Create new project', () => {
    cy.get('button .anticon-plus').click();

    cy.contains('Add Project').click();

    cy.get('#newProjectForm_name').type('test');

    cy.antSelect('#newProjectForm_taskType', 'Token Classification');

    cy.get('button.ant-modal-close').click();
  });
});
