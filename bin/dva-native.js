#! /usr/bin/env node
const path = require("path");
const fs = require("fs");
const readline = require("readline");
const exec = require("child_process").exec;
const argv = process.argv.slice(2);
const cwdPath = process.cwd();
const templatePath = path.resolve(__dirname, "../template");

const projectName = argv[1];
const targetPath = `${cwdPath}/${projectName}`;

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

function copyFile(_targetPath, _templatePath) {
  fs.writeFileSync(_targetPath, fs.readFileSync(_templatePath), "utf-8");
  //fs.createReadStream(_targetPath).pipe(fs.createWriteStream(_templatePath));
}

(async function () {
  if (projectName === undefined) {
    if (argv[0] === "--help") {
      console.log("Use dva-native new project to create a new project!");
      return;
    }
    if (argv[0] === "-v") {
      console.log(require("../package.json").version);
      return;
    }
  }
  if (argv[0] !== "new") {
    console.warn(
      `You should use dva-native new to create you app, do not use dva-native ${
      argv[0]
      }`
    );
    return;
  }
  if (fsExistsSync(targetPath)) {
    if (await confirm()) {
      try {
        fs.unlinkSync(targetPath);
      } catch (error) {
        console.log(error);
        process.exit();
      }
      mkTargetDir();
      if (traverse(templatePath, targetPath)) {
        install();
      }
    }
  } else {
    mkTargetDir();
    if (traverse(templatePath, targetPath)) {
      install();
    }
  }
})();
