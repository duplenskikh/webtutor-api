describe("Nerd spec", () => {
  it("/ping", () => {
    cy.request("/ping")
      .then(({ status, duration, body }) => {
        expect(status).to.be.eq(200);
        expect(duration).to.be.lte(300);
        expect(body).to.be.eq("pong\n");
      });
  });
});
