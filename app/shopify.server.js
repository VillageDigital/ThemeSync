import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { Firestore } from "@google-cloud/firestore"; // ✅ Replaced Prisma with Firestore

// Initialize Firestore
const firestore = new Firestore();
const sessionCollection = firestore.collection("shopify_sessions");

// Firestore Session Storage Class
class FirestoreSessionStorage {
  async storeSession(session) {
    await sessionCollection.doc(session.id).set(session);
  }

  async loadSession(id) {
    const doc = await sessionCollection.doc(id).get();
    return doc.exists ? doc.data() : undefined;
  }

  async deleteSession(id) {
    await sessionCollection.doc(id).delete();
  }
}

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),  
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new FirestoreSessionStorage(), // ✅ Now using Firestore
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
