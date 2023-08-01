describe("Lists spec", () => {
  beforeEach(() => {
    cy.loginByForm();
  });

  it("/lists", () => {
    cy.request("/lists")
      .then(({ status, duration, body }) => {
        expect(status).to.be.eq(200);
        expect(duration).to.be.lte(1500);
        expect(body.data.length).to.be.gte(10);
        Cypress.env("listName", body.data[0]);
      });
  });

  it("/list", () => {
    cy.request(`/list?name=${Cypress.env("listName")}`)
      .then(({ status, duration, body }) => {
        expect(status).to.be.eq(200);
        expect(duration).to.be.lte(500);
        expect(body.data.length).to.be.gte(0);
      });
  });
});
