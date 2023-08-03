describe("Collaborators spec", () => {
  beforeEach(() => {
    cy.loginByForm();
  });

  it("/collaborator/current", () => {
    cy.request("/collaborator/current")
      .then(({ status, duration, body }) => {
        expect(status).to.be.eq(200);
        expect(duration).to.be.lte(500);
        expect(body).to.have.any.keys("id");
      });
  });

  it("/collaborators", () => {
    cy.request("/collaborators")
      .then(({ status, duration, body }) => {
        expect(status).to.be.eq(200);
        expect(duration).to.be.lte(1500);
        expect(body.total).to.be.gt(0);
        expect(body.items).to.be.an("array");
        expect(body.items.length).to.be.gt(0);
      });
  });
});
