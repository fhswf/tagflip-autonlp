describe('test main view', () => {
  const time = new Date();
  const name = `Test_${time.toISOString()}`;

  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    cy.visit('https://autonlp.informatik.fh-swf.de/test/static/');
  });

  it('Project selector should be present', () => {
    cy.contains('Select Project...').should('exist');
  });

  it('Create new project', () => {
    cy.get('button .anticon-plus').click();

    cy.contains('Add Project').click();

    cy.get('#newProjectForm_name').type(name);
    cy.antSelect('#newProjectForm_taskType', 'Token Classification');
    cy.contains('Submit').click();
  });

  it('Set dataset', () => {
    cy.contains(name).click();
    cy.get('#dataset').click();
    cy.contains('huggingface').click();
    cy.contains('germeval_14').click();
    cy.get(
      '[data-path-key="huggingface__RC_CASCADER_SPLIT__germeval_14__RC_CASCADER_SPLIT__germeval_14"]',
    ).click();
    cy.contains('Save changes').click();
  });

  it('Schedule training', () => {
    cy.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from
      // failing the test
      if (err.message.includes('ResizeObserver')) {
        return false;
      } else {
        return true;
      }
    });
    cy.contains(name).click();
    cy.contains('Training').click();
    cy.get('button').contains('Plan new').click();
    cy.contains('BERT German').click();
    cy.contains('Minimal configuration').click();
    cy.get('#configure_parameters_form_hyperParameters_num_train_epochs')
      .clear()
      .type('2');
    cy.contains('Next').click();
    cy.contains('Finish').click();
  });
});
