import { Route } from "..";
import { dapi } from "../dapi";

export function getRoute(pattern: string) {
  pattern = StrReplaceOne(pattern, dapi.config.pattern, "");
  let i = 0;

  for (i = 0; i < dapi.routes.length; i++) {
    if (dapi.routes[i].pattern == pattern) {
      return dapi.routes[i];
    }
  }
}

function ensureWebRule() {
  const webRuleCode = `dapi_${dapi.config.pattern}`;
  const query = ArrayOptFirstElem(tools.xquery(`for $e in web_rules where $e/code = ${SqlLiteral(webRuleCode)} return $e`));

  let webRuleDocument;

  if (query === undefined) {
    webRuleDocument = tools.new_doc_by_name<WebRuleDocument>("web_rule");
    webRuleDocument.BindToDb();
  } else {
    webRuleDocument = tools.open_doc<WebRuleDocument>(query.id.Value);
  }

  webRuleDocument.TopElem.code.Value = webRuleCode;
  webRuleDocument.TopElem.name.Value = "Правило для api";
  webRuleDocument.TopElem.url.Value = `${dapi.config.pattern}/*`;
  webRuleDocument.TopElem.is_enabled.Value = true;
  webRuleDocument.TopElem.redirect_type.Value = 0;
  webRuleDocument.TopElem.redirect_url.Value = dapi.basepath.replace("x-local://wt/web", "") + "/api.html";
  webRuleDocument.Save();

  alert(`Web rule successfully ${webRuleDocument.NeverSaved ? "created" : "updated"} ${webRuleDocument.DocID}`);
}

export function init() {
  ensureWebRule();
  DropFormsCache("./../controllers/*");
  const apis = ReadDirectory("./../controllers");
  let i = 0;
  let j = 0;
  let apiFunctions;
  const routes: Route[] = [];
  let obj;

  for (i = 0; i < apis.length; i++) {
    apiFunctions = OpenCodeLib(apis[i]).functions() as Route[];

    for (j = 0; j < apiFunctions.length; j++) {
      obj = apiFunctions[j];
      routes.push({
        method: obj.method,
        pattern: obj.pattern,
        callback: obj.callback,
        access: obj.access,
        params: obj.HasProperty("params") ? obj.params : {}
      });
    }
  }

  dapi.routes = routes;
}
