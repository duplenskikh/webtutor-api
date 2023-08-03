describe("Positions spec", () => {
  beforeEach(() => {
    cy.loginByForm();
  });

  it("/positions", () => {
    cy.request("/positions")
      .then(({ status, duration, body }) => {
        expect(status).to.be.eq(200);
        expect(duration).to.be.lte(1500);
        expect(body.items.length).to.be.gte(10);
        Cypress.env("positionId", body.items[0].id);
      });
  });

  it("/position", () => {
    cy.request(`/position?id=${Cypress.env("positionId")}`)
      .then(({ status, duration, body }) => {
        expect(status).to.be.eq(200);
        expect(duration).to.be.lte(500);
        expect(body).to.have.any.keys("id");
      });
  });
});
