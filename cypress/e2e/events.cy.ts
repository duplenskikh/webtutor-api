describe("Collaborator spec", () => {
  beforeEach(() => {
    cy.loginByForm();
  });

  it("/collaborator/current", () => {
    cy.request("/collaborator/current")
      .then(({ status, duration, body }) => {
        expect(status).to.be.eq(200);
        expect(duration).to.be.lte(500);
        expect(body.data).to.have.any.keys("id");
      });
  });
});
