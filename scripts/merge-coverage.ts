/* eslint-disable @typescript-eslint/no-var-requires */

import fs from 'fs-extra';
import yargs from 'yargs';

const { createReporter } = require('istanbul-api');
const { createCoverageMap } = require('istanbul-lib-coverage');

async function main(): Promise<void> {
  const argv = yargs.options({
    report: {
      type: 'array',
      desc: 'Path of json coverage report file',
      demandOption: true,
    },
    reporters: {
      type: 'array',
      default: ['json', 'lcov'],
    },
  }).argv;

  const reportFiles = argv.report as string[];
  const reporters = argv.reporters as string[];

  const map = createCoverageMap({});

  reportFiles.forEach((file) => {
    const r = fs.readJsonSync(file);
    map.merge(r);
  });

  const reporter = createReporter();

  reporter.addAll(reporters);
  reporter.write(map);
  console.log('Created a merged coverage report in ./coverage');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
