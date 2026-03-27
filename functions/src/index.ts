import { onRequest } from 'firebase-functions/v2/https';

// Reuse the existing Express app from backend/node (compiled JS)
// Firebase Functions should not compile backend sources; import compiled output.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const app = require('../../backend/node/dist/app').default;

export const nodeApi = onRequest(
  {
    region: 'us-central1',
    cors: true,
  },
  app
);
