#! /usr/bin/env node
const fs = require(`fs`);
const path = require(`path`);
const exec = require(`child_process`).execSync;
const yargs = require(`yargs`);
const appName = `nug`;
const configFileBase = appName + `file`;
const argv = yargs
  .usage(
`Initialization: ${appName} init [OPTIONS]
Usage: npm run build [action] -- [OPTIONS] (after initilization)
       ${appName} [action] [OPTIONS]`)
  .help(`help`)
  .option(`help`, {
    alias: `h`
  })
  .option(configFileBase, {
    alias: configFileBase[0],
    describe: `specify configuration file`,
    default:``
  })
  .option(`purge`, {
    alias: `u`,
    describe: `purge client folder before building`,
    default: true
  })
  .option(`log-level`, {
    alias: `l`,
    type:`number`,
    describe: `verbosity`,
    default: 1
  })
  .option(`logVerbose`, {
    alias: `v`,
    type: `boolean`,
    describe: `logVerbose`
  })
  .argv;

  const action = argv._[0] || ``;
  //Logging
  const logLevel = argv[`logVerbose`] ? 2 : argv[`log-level`];
  const log = logLevel > 0 ? console.log.bind(console) : function(){};
  const logError = logLevel > -1 ? console.error.bind(console) : function(){};
  const logVerbose = logLevel > 1 ? console.log.bind(console) : function(){};
  log(`log level: ${[`quiet`,`normal`,`verbose`][logLevel]}`);
  const cwd = process.cwd();
  const packageFilePath = path.resolve(cwd, `package.json`);
  //Funcions
  const getconfigFile = () => {
    var configFilepath = path.resolve(cwd, argv[configFileBase]);
    if(!argv[configFileBase]){
     configFilepath = path.resolve(cwd, `${configFileBase}.json`);
     if(!fs.existsSync(configFilepath)) configFilepath = path.resolve(cwd, configFileBase);;
    }
    if(!fs.existsSync(configFilepath))
      return logError(new Error(`missing ${configFileBase}: ${configFilepath}`));
    return JSON.parse(fs.readFileSync(configFilepath));
  };
  const initialize = () => {
    try{
      var pack = JSON.parse(fs.readFileSync(packageFilePath));
    }catch(error){
      return logError(new Error(`please use npm init to install a valid package.json file and try again: ${error}`));
    }
    log(`installing ${appName} locally...`);
    exec(`npm install --save ${appName}`);
    log(`${appName} installed!`);
    log(`installing npm build script...`);
    pack.scripts = pack.scripts || {};
    pack.scripts.build = `./node_modules/${appName}/bin/${appName}.js build`;
    pack.scripts.purge = `./node_modules/${appName}/bin/${appName}.js purge`;
    log(`npm build scrip installed!`);
    log(`type npm run build`);
    fs.writeFileSync(packageFilePath, content);
  };
  const rmdir = require('../lib/rmdir');
  const build = () => {
    const configFile = getconfigFile();
    if(!configFile) return logError(new Error(`valid ${configFileBase} required to build`));
    if(configFile.purge === true){
      rmdir(path.resolve(cwd,configFile.dir || 'www'));
    }
    try{
      fs.mkdirSync(path.resolve(configFile.dir || `www`));
    }catch(error){

    }
    log(`building files...`);
    logVerbose(
`building with:
${JSON.stringify(configFile, undefined, ` `)}`)
    log(`built!`);
  };

  switch(action){
    case ``:
    case `init`:
    case `initialize`:
      return initialize();
      break;
    case `build`:
      return build();
      break;
    case `purge`:
      try{
        return rmdir(path.resolve(cwd, getconfigFile().dir || 'www'));
      }catch(error){
        return logError(`valid ${configFileBase} required to purge: ${error}`);
      }
      break;
  };
