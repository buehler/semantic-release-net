async function prepare() {
  const m = await import('./prepare.js');
  m.default(arguments[0], arguments[1]);
}

async function publish() {
  const m = await import('./publish.js');
  m.default(arguments[0], arguments[1]);
}

async function verifyConditions() {
  const m = await import('./verify-conditions.js');
  m.default(arguments[0], arguments[1]);
}

export { prepare, publish, verifyConditions };
