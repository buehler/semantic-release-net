const p = require('../../dist/publish');

const publish = p.default;
console.log('publish.');
publish(
  {},
  {
    logger: console,
    env: {},
  }
).then(() => console.log('Done'), console.error);
