import { Route } from "..";
import { dapi } from "../dapi";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/ping",
    callback: "pong",
    access: "anonymous"
  }];
}

export function pong() {
  return dapi.utils.response.ok("pong");
}
