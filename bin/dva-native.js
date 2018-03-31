#! /usr/bin/env node
const path = require("path");
const fs = require("fs");
const readline = require("readline");
const help = require("./helper");
const shell = require("shelljs");
const colors = require("colors");
const cwdPath = process.cwd();
const package = require("../package.json");
const templatePath = path.resolve(__dirname, "../template");
const program = require("../utils/commander");

function installReactNativeRename() {
  return new Promise((resolve, reject) => {
    if (shell.which("git")) {
      resolve();
    } else {
      shell.exec(
        "npm install react-native-rename -g --registry=http://registry.cnpmjs.org",
        err => {
          if (err) {
            shell.exec("npm install react-native-rename -g", err => {
              if (err) {
                reject(err);
              }
            });
          }
          resolve();
        }
      );
    }
  });
}

function printVersion() {
  console.log(package.version);
}

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
function copyFile(targetPath, templatePath) {
  if (/png/.test(targetPath)) {
    fs.createReadStream(templatePath).pipe(fs.createWriteStream(targetPath));
  } else {
    fs.writeFileSync(targetPath, fs.readFileSync(templatePath));
  }
}
function confirm() {
  const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve, reject) => {
    terminal.question(
      "Floder is already exits, do you want override it ? yes/no ",
      answer => {
        if (answer === "yes" || answer === "y") {
          resolve(true);
          terminal.close();
        } else {
          process.exit();
        }
      }
    );
  });
}

function copyTemplate(templatePath, targetPath) {
  try {
    const paths = fs.readdirSync(templatePath);
    paths.forEach(_path => {
      const _targetPath = path.resolve(targetPath, _path);
      const _templatePath = path.resolve(templatePath, _path);
      console.log("creating..." + _targetPath);
      if (!fs.statSync(_templatePath).isFile()) {
        fs.mkdirSync(_targetPath);
        copyTemplate(_templatePath, _targetPath);
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
  shell.exec(
    `cd ${projectName} && npm install --registry=http://registry.cnpmjs.org`,
    err => {
      if (err) {
        shell.exec(`cd ${projectName} && npm install`, err => {
          if (err) {
            console.log(err);
          }
          process.exit();
        });
      } else {
        console.log(
          colors.yellow(
            [
              `Success! Created ${projectName} at ${cwdPath}.`,
              "Inside that directory, you can run several commands and more:",
              "  * npm start: Starts you project.",
              "  * npm test: Run test.",
              "We suggest that you begin by typing:",
              `  cd ${projectName}`,
              "  npm start",
              "Happy hacking!"
            ].join("\n")
          )
        );
      }
    }
  );
}
async function newProject(projectName) {
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
      if (copyTemplate(templatePath, targetPath)) {
        rename(targetPath, projectName);
        installDependencies(projectName);
      }
    }
  } else {
    fs.mkdirSync(targetPath);
    if (copyTemplate(templatePath, targetPath)) {
      rename(targetPath, projectName);
      installDependencies(projectName);
    }
  }
}
function newLatestProject(projectName) {
  shell.exec(
    `git clone https://github.com/nihgwu/react-native-dva-starter.git`,
    err => {
      if (!err) {
        rename(targetPath, projectName);
      }
    }
  );
}

function rename(targetPath, projectName) {
  try {
    const paths = fs.readdirSync(targetPath);
    paths.forEach(subpath => {
      const subfile = path.resolve(targetPath, subpath);
      console.log("creating..." + subfile);
      const newPath = subfile.replace(/DvaStarter/gim, projectName);
      if (!fs.statSync(subfile).isFile() && subfile !== "images") {
        fs.renameSync(subfile, newPath);
        rename(newPath, projectName);
      } else {
        if (subfile !== "gradle-wrapper.jar") {
          fs.renameSync(subfile, newPath);
          fs.writeFileSync(
            newPath,
            fs
              .readFileSync(newPath)
              .toString()
              .replace(/DvaStarter/gim, projectName),
            "utf-8"
          );
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
}

try {
  installReactNativeRename();
  program.option("-h, --help", help).option("-v, --version", printVersion);
  program.command("new <projectName>").action(newProject);
  program.command("git <projectName>").action(newLatestProject);
  program.parse(process.argv);
} catch (error) {
  console.log(error);
}
