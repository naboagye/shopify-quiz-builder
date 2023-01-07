import { Client } from "@gadget-client/curlsfusion-hair-quiz";

export const api = new Client({
  authenticationMode: {
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
  },
});
