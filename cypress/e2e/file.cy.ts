describe("File spec", () => {
  beforeEach(() => {
    cy.loginByForm();
  });

  it("/file", () => {
    cy.fixture("files.json").then(x => {
      cy.request({
        url: "/file",
        method: "PUT",
        body: {
          name: x[0].name,
          content: Buffer.from(x[0].content).toString("base64")
        }
      })
        .then(({ status, duration, body }) => {
          expect(status).to.be.eq(201);
          expect(duration).to.be.lte(1500);
          Cypress.env("fileId", body.id);
        });
    });
  });

  it("/file", () => {
    cy.request(`/file?id=${Cypress.env("fileId")}`)
      .then(({ status }) => {
        expect(status).to.be.eq(200);
      });
  });
});
