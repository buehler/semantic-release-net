const p = require('../../dist/prepare');

const prepare = p.default;
console.log('Prepare.');
prepare(
  {},
  {
    logger: console,
    env: {},
    nextRelease: { version: '1337.0.42', notes: 'Some notes.' },
  }
).then(() => console.log('Done'), console.error);
