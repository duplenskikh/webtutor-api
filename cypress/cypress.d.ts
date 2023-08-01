/* eslint-disable no-unused-vars */
declare namespace Cypress {
  interface Chainable {
    loginByForm(): Chainable<Cypress.Response<void>>
    formRequest(method: string, url: string, formData: FormData, done: CallableFunction): void;
  }
}
