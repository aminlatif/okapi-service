#!/usr/bin/env node
import minimist from 'minimist';

const rawArgv = process.argv.slice(2)
const args = minimist(rawArgv, {
  boolean: [
    // build
    'modern',
    'report',
    'report-json',
    'inline-vue',
    'watch',
    // serve
    'open',
    'copy',
    'https',
    // inspect
    'verbose'
  ]
})

import Service from "../lib/Service.js";
const service = new Service()

const command = args._[0]

service.run(command, args, rawArgv).catch(err => {
  console.log(err);
  process.exit(1)
})