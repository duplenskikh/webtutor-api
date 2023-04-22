import { Route } from "..";
import { dapi } from "../dapi";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/example",
    callback: "example",
    access: "anonymous"
  }];
}

export function example() {
  return dapi.utils.response.ok("check it");
}
