import { app } from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { ensureTtlIndexes } from '../src/config/ttlIndexes.js';

let isInitialized = false;

export default async function handler(req, res) {
  try {
    await connectDB();
    if (!isInitialized) {
      ensureTtlIndexes().catch(() => {});
      isInitialized = true;
    }
    return app(req, res);
  } catch (error) {
    console.error('Serverless invocation error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVERLESS_ERROR',
        message: 'Backend serverless execution failed',
      },
    });
  }
}
