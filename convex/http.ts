import { auth } from "./auth";
import router from "./router";
import { stripeWebhook } from "./stripeWebhook";

const http = router;

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: stripeWebhook,
});

auth.addHttpRoutes(http);

export default http;
