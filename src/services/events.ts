import { dapi } from "../dapi";

export function getEvents() {
  return dapi.utils.query.extract(`for $e in events return $e`);
}
