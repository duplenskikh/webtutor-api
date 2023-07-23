import { dapi } from "../dapi";

export function getEvents() {
  return dapi.utils.query.extract<EventCatalogDocument>("for $e in events return $e");
}
