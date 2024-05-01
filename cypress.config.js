// eslint-disable-next-line import/no-extraneous-dependencies
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: 'b999ha',
  e2e: {
    baseUrl: 'http://localhost:3000',
  },
});
