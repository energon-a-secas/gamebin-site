import { httpRouter } from "convex/server";
import { getPrice, options } from "./steam";

const http = httpRouter();

http.route({
  path: "/steam/price",
  method: "GET",
  handler: getPrice,
});

http.route({
  path: "/steam/price",
  method: "OPTIONS",
  handler: options,
});

export default http;
