"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeApi = void 0;
const https_1 = require("firebase-functions/v2/https");
// Reuse the existing Express app from backend/node (compiled JS)
// Firebase Functions should not compile backend sources; import compiled output.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const app = require('../../backend/node/dist/app').default;
exports.nodeApi = (0, https_1.onRequest)({
    region: 'us-central1',
    cors: true,
}, app);
