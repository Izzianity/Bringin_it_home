import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { getConfig } from "../config/index.js";

let app: App | undefined;

export function getFirebaseApp(): App {
  if (app) return app;
  const existing = getApps()[0];
  if (existing) return (app = existing);

  const { FIREBASE_PROJECT_ID, FIREBASE_SERVICE_ACCOUNT_JSON } = getConfig();
  app = initializeApp({
    projectId: FIREBASE_PROJECT_ID,
    ...(FIREBASE_SERVICE_ACCOUNT_JSON
      ? { credential: cert(JSON.parse(FIREBASE_SERVICE_ACCOUNT_JSON)) }
      : {}),
  });
  return app;
}

export function verifyIdToken(idToken: string): Promise<DecodedIdToken> {
  // checkRevoked=true so disabled/signed-out users are rejected promptly
  return getAuth(getFirebaseApp()).verifyIdToken(idToken, true);
}
