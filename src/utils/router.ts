import { Route, wshcmx } from "index";

export function getRoute(pattern: string, method: string) {
  pattern = StrReplaceOne(pattern, wshcmx.config.pattern, "");
  let i = 0;

  for (i = 0; i < wshcmx.routes.length; i++) {
    if (wshcmx.routes[i].pattern == pattern && wshcmx.routes[i].method == method) {
      return wshcmx.routes[i];
    }
  }
}

function createRouterRule() {
  const webRuleCode = `wshcmx_${wshcmx.config.pattern}`;
  const query = ArrayOptFirstElem(tools.xquery<{ id: XmlElem<number> }>(`for $e in web_rules where $e/code = ${SqlLiteral(webRuleCode)} return $e`));

  let webRuleDocument;

  if (query === undefined) {
    webRuleDocument = tools.new_doc_by_name<WebRuleDocument>("web_rule");
    webRuleDocument.BindToDb();
  } else {
    webRuleDocument = tools.open_doc<WebRuleDocument>(query.id.Value);
  }

  webRuleDocument.TopElem.code.Value = webRuleCode;
  webRuleDocument.TopElem.name.Value = "Правило для api";
  webRuleDocument.TopElem.url.Value = `${wshcmx.config.pattern}/*`;
  webRuleDocument.TopElem.is_enabled.Value = true;
  webRuleDocument.TopElem.redirect_type.Value = 0;
  webRuleDocument.TopElem.redirect_url.Value = `/${wshcmx.config.basepath}/api.html`;
  webRuleDocument.Save();

  // eslint-disable-next-line no-alert
  alert(`Правило редиректа ${webRuleDocument.DocID} успешно ${webRuleDocument.NeverSaved ? `${"создано"}` : `${"обновлено"}` }`);
  // eslint-disable-next-line no-alert
  alert(`Все запросы ${webRuleDocument.TopElem.url.Value} будут перенаправляться на ${webRuleDocument.TopElem.redirect_url.Value}`);
}

type ControllerLibrary = {
  functions(): Route[];
};

export function init() {
  createRouterRule();
  DropFormsCache("./../controllers/*");
  const apis = ReadDirectory("./../controllers");
  let i = 0;
  let j = 0;
  let apiFunctions;
  const routes: Route[] = [];
  let obj;
  let isDevelopmentEnv = wshcmx.config.env == "development";

  for (i = 0; i < apis.length; i++) {
    apiFunctions = OpenCodeLib<ControllerLibrary>(apis[i]).functions();

    for (j = 0; j < apiFunctions.length; j++) {
      obj = apiFunctions[j];

      if (obj.access == "dev" && !isDevelopmentEnv) {
        continue;
      }

      routes.push({
        method: obj.method,
        pattern: obj.pattern,
        callback: obj.callback,
        url: apis[i],
        access: obj.access,
        params: obj.HasProperty("params") ? obj.params : {}
      });
    }
  }

  wshcmx.routes = routes;
}
