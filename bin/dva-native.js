#! /usr/bin/env node
const path = require("path");
const fs = require("fs");
const readline = require("readline");
const help = require("./helper");
const shell = require("shelljs");
const exec = require("child_process").exec;
const cwdPath = process.cwd();
const package = require("../package.json");
const templatePath = path.resolve(__dirname, "../template");
const program = require("../utils/commander");

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

function printVersion() {
  console.log(package.version);
}

(function() {
  try {
    installReactNativeRename();
    program
      .option("-h, --help", help)
      .option("-v, --version", printVersion)
      .command("new <projectName>")
      .action(async projectName => {
        const targetPath = `${cwdPath}/${projectName}`;
        const backupPath = `${cwdPath}/.${projectName}`;
        if (fsExistsSync(targetPath)) {
          if (await confirm()) {
            try {
              shell.rm("-rf", targetPath);
            } catch (error) {
              console.log(error);
              process.exit();
            }
            fs.mkdirSync(targetPath);
            if (traverse(templatePath, targetPath)) {
              installDependencies(projectName);
            }
          }
        } else {
          fs.mkdirSync(targetPath);
          if (traverse(templatePath, targetPath)) {
            installDependencies(projectName);
          }
        }
      })
      .parse(process.argv);
  } catch (error) {
    console.log(error);
  }
})();
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
function copyFile(_targetPath, _templatePath) {
  fs.writeFileSync(_targetPath, fs.readFileSync(_templatePath), "utf-8");
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

function installDependencies(projectName) {
  console.log("\ninstalling...");
  shell.exec(`cd ${projectName} && npm install`, err => {
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
