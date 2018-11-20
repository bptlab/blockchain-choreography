const util = require('util');
const rimraf = util.promisify(require('rimraf'));
const exec = util.promisify(require('child_process').exec);

async function execute(command) {
  const { stdout, stderr } = await exec(command);
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
}

async function clean_build() {
  // Delete build directory
  await rimraf('build');
  await execute('truffle compile');
  await execute('truffle migrate');
}

clean_build();
