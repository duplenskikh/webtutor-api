import { wshcmx, Route } from "index";

type Authentication = {
  id: number;
  type: Route["access"];
};

export function authenticateUser(req: Request): Authentication | null {
  const userInit = tools_web.user_init(req, req.Query);

  if (!userInit.access) {
    wshcmx.utils.log.info(`Session ${wshcmx.utils.request.getHeader(req.Header, "SessionID")} is unauthorized due to ${userInit.error_text}`, "passport");
    return null;
  }

  const id = req.Session.Env.curUserID;

  wshcmx.utils.log.info(`User "${id}" was authorized`, "passport");

  return {
    id,
    type: "user"
  };
}

export function authenticateApplication(req: Request, xAppId: string): Authentication | null {
  if (StrCharCount(Trim(String(xAppId))) === 0) {
    wshcmx.utils.log.error(
      "\"x-app-id\" header is empty",
      "passport"
    );
    return null;
  }

  const login = req.AuthLogin;
  const password = req.AuthPassword;

  if (wshcmx.utils.type.isUndef(login) || wshcmx.utils.type.isUndef(password)) {
    wshcmx.utils.log.error(
      `Application "${xAppId}" hasn't access due to empty login or password`,
      "passport"
    );
    return null;
  }

  const applicationDocument = tools.get_doc_by_key<RemoteApplicationDocument>("remote_application", "app_id", xAppId);

  if (applicationDocument === null) {
    wshcmx.utils.log.error(
      `Application [${xAppId}] hasn't access due to application xml document not found`,
      "passport"
    );
    return null;
  }

  const madePassword = tools.make_password(password, false);
  let hasAccess = false;
  const credentials = applicationDocument.TopElem.credentials;
  let credentialDocument;

  for (let i = 0; i < credentials.ChildNum; i++) {
    credentialDocument = tools.open_doc<CredentialDocument>(credentials[i].id);

    if (credentialDocument === undefined) {
      wshcmx.utils.log.error(
        `Credential xml document not found by id "${credentials[i].id}"`,
        "passport"
      );
      continue;
    }

    if (
      credentialDocument.TopElem.login == login
      && tools.make_password(credentialDocument.TopElem.password, true) == madePassword
    ) {
      hasAccess = true;
      break;
    }
  }

  if (!hasAccess) {
    wshcmx.utils.log.error(
      `Некорректный логин или пароля для приложения ${xAppId}`,
      "passport"
    );

    return null;
  }

  return {
    id: applicationDocument.DocID,
    type: "application"
  };
}

/**
 * Проверяет авторизацию и возвращает объект пользователя или приложения.
 * @param { Request } Request Стандартный объект `Request`.
 * @returns { any }
 */
export function authenticate(req: Request) {
  const xAppId = wshcmx.utils.request.getHeader(req.Header, "x-app-id");

  if (wshcmx.utils.type.isUndef(xAppId)) {
    return authenticateUser(req);
  } else {
    return authenticateApplication(req, xAppId);
  }
}
