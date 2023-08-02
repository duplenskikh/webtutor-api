Cypress.Commands.add("loginByForm", () => {
  const [ login, password ] = [Cypress.env("user_login"), Cypress.env("user_password")];

  Cypress.log({
    name: "loginByForm",
    message: `${login} | ${password}`,
  });

  cy.session([login, password], () => {
    cy.request({
      method: "POST",
      url: "/_wt/home",
      form: true,
      body: {
        user_login: login,
        user_password: password,
        set_auth: 1
      },
    });
  }, {
    cacheAcrossSpecs: true,
  });
});

Cypress.Commands.add("formRequest", (method, url, formData, done) => {
  const xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.onload = () => {
    done(xhr);
  };

  xhr.onerror = () => {
    done(xhr);
  };

  xhr.send(formData);
});

export {};
