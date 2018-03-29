#! /usr/bin/env node
const path = require("path");
const fs = require("fs");
const readline = require("readline");
const help = require("./helper");
const program = require("commander");
const shell = require("shelljs");
const exec = require("child_process").exec;
const argv = process.argv.slice(2);
const cwdPath = process.cwd();
const package = require("../package.json");
const templatePath = path.resolve(__dirname, "../template");
const projectName = argv[1];
const command = argv[0];
const targetPath = `${cwdPath}/${projectName}`;
const backupPath = `${cwdPath}/.${projectName}`;
const aaa = require("../utils/commander");
aaa
  .parse(process.argv)
  .option("-h, --help", help)
  .option("-v, --version", () => console.log(package.version))
  .command("new <233>")
  .action(res => {
    console.log(res+1);
  });
function installReactNativeRename() {
  return new Promise((resolve, reject) => {
    exec("npm install react-native-rename --registry=http://registry.cnpmjs.org", err => {
      if (err) {
        exec("npm install react-native-rename");
      }
      resolve();
    });
  });
}

/*(async function() {
  installReactNativeRename();
  program.option("-h", "help");
  program.option("-v, --version", help);
  program.command("new <projectName>").action(projectName => {
    //console.log(projectName);
  });
  program.parse(process.argv);
  if (command === "init") {
    if (fsExistsSync(targetPath)) {
      if (await confirm()) {
        try {
          shell.rm("-rf", targetPath);
        } catch (error) {
          console.log(error);
          process.exit();
        }
        if (traverse(templatePath, targetPath)) {
          install();
        }
      }
    } else {
      fs.mkdirSync(targetPath);
      if (traverse(templatePath, targetPath)) {
        install();
      }
    }
  }

  /*console.warn(
      `You should use dva-native init <ProjectName> to create you project, do not use dva-native ${command}`
    );
})();*/

function mkTargetDir() {
  fs.mkdirSync(targetPath);
}

function fsExistsSync(path) {
  try {
    fs.accessSync(path, fs.F_OK);
  } catch (e) {
    return false;
  }
  return true;
}

function confirm() {
  const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve, reject) => {
    terminal.question("Floder is already exits, do you want override it ? yes/no ", answer => {
      if (answer === "yes" || answer === "y") {
        resolve(true);
        terminal.close();
      } else {
        process.exit();
      }
    });
  });
}

function traverse(templatePath, targetPath) {
  try {
    const paths = fs.readdirSync(templatePath);
    paths.forEach(_path => {
      const _targetPath = path.resolve(targetPath, _path);
      const _templatePath = path.resolve(templatePath, _path);
      console.log("creating..." + _targetPath);
      if (!fs.statSync(_templatePath).isFile()) {
        fs.mkdirSync(_targetPath);
        traverse(_templatePath, _targetPath);
      } else {
        copyFile(_targetPath, _templatePath);
      }
    });
  } catch (error) {
    console.log(error);
    return false;
  }
  return true;
}

function install() {
  console.log("\ninstalling...");
  exec(`cd ${projectName} && npm install`, err => {
    if (err) {
      console.log(err);
      process.exit();
    } else {
      console.log(
        `
Success! Created ${projectName} at ${cwdPath}.
Inside that directory, you can run several commands and more:
  * npm start: Starts you project.
  * npm test: Run test.
We suggest that you begin by typing:
  cd ${projectName}
  npm start
Happy hacking!`
      );
    }
  });
}
function copyFile(_targetPath, _templatePath) {
  fs.writeFileSync(_targetPath, fs.readFileSync(_templatePath), "utf-8");
  //fs.createReadStream(_targetPath).pipe(fs.createWriteStream(_templatePath));
}
