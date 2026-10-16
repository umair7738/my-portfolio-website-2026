const { createStaticServer } = require("../scripts/serve-site");

module.exports = async function globalSetup() {
  const port = Number(process.env.PLAYWRIGHT_PORT || 4173);
  const server = await createStaticServer({ root: process.cwd(), port });
  return async function globalTeardown() {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  };
};
