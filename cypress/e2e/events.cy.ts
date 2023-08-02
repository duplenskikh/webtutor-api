describe("Events spec", () => {
  beforeEach(() => {
    cy.loginByForm();
  });

  it("/events", () => {
    cy.request("/events")
      .then(({ status, duration, body }) => {
        expect(status).to.be.eq(200);
        expect(duration).to.be.lte(1500);
        expect(body.data.items.length).to.be.gte(10);
        Cypress.env("eventId", body.data.items[0].id);
      });
  });

  it("/event", () => {
    cy.request(`/event?id=${Cypress.env("eventId")}`)
      .then(({ status, duration, body }) => {
        expect(status).to.be.eq(200);
        expect(duration).to.be.lte(500);
        expect(body.data).to.have.any.keys("id");
      });
  });
});
