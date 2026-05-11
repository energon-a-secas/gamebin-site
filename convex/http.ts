import { httpRouter } from "convex/server";
import { getPrice, getTags, options } from "./steam";

const http = httpRouter();

http.route({
  path: "/steam/price",
  method: "GET",
  handler: getPrice,
});

http.route({
  path: "/steam/tags",
  method: "GET",
  handler: getTags,
});

http.route({
  path: "/steam/price",
  method: "OPTIONS",
  handler: options,
});

http.route({
  path: "/steam/tags",
  method: "OPTIONS",
  handler: options,
});

export default http;
