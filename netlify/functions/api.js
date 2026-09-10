const serverless = require('serverless-http');
const { app, connectDB } = require('../../backend/server');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  if (!event.path.endsWith('/health')) await connectDB();
  return handler(event, context);
};