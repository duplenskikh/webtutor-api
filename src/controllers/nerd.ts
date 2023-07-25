import { Route } from "..";
import { dapi } from "../dapi";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/nerd/routes",
    callback: "getRoutes",
    access: "dev"
  }];
}

export function getRoutes() {
  return dapi.utils.response.ok(dapi.routes);
}
