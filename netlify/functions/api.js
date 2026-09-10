const serverless = require('serverless-http');
const { app, connectDB } = require('../../backend/server');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  if (!event.path.endsWith('/health')) {
    try {
      await connectDB();
    } catch (error) {
      return {
        statusCode: error.statusCode || 503,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: error.message || 'Database connection failed',
        }),
      };
    }
  }

  return handler(event, context);
};
