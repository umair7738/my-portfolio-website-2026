const path = require("path");
const { createStaticServer } = require("../scripts/serve-dist");

module.exports = async function globalSetup() {
  const server = await createStaticServer({ root: path.join(process.cwd(), "dist"), port: 4173 });
  return async function globalTeardown() {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  };
};
