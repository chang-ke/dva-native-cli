#! /usr/bin/env node
const path = require("path");
const fs = require("fs");
const readline = require("readline");
const help = require("./helper");
const exec = require("child_process").exec;
const argv = process.argv.slice(2);
const cwdPath = process.cwd();
const package = require("../package.json");
const templatePath = path.resolve(__dirname, "../template");
const projectName = argv[1];
const command = argv[0];
const targetPath = `${cwdPath}/${projectName}`;
const backupPath = `${cwdPath}/.${projectName}`;

function installReactNativeRename() {
  return new Promise((resolve, reject) => {
    exec("npm install react-native-rename -g", err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

(async function() {
  installReactNativeRename();
  if (projectName === undefined) {
    if (command === "--help" || command === "-h") {
      help();
      process.exit(0);
    }
    if (command === "--version" || command === "-v") {
      console.log(package.version);
      process.exit(0);
    }
  } else {
    if (command === "init") {
      if (fsExistsSync(targetPath)) {
        //if exits
        if (await confirm()) {
          try {
            rmdirR(targetPath);
          } catch (error) {
            console.log(error);
            process.exit();
          }
          /*if (traverse(templatePath, targetPath)) {
            install();
          }*/
        }
      } else {
        //not exits
        fs.mkdirSync(targetPath);
        if (traverse(templatePath, targetPath)) {
          install();
        }
      }
    }
  }
  if (command !== "init") {
    console.warn(
      `You should use dva-native init <ProjectName> to create you project, do not use dva-native ${command}`
    );
    process.exit(0);
  }
})();

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

function rmdirR(targetPath) {
  function rmdir(targetPath) {
    try {
      const paths = fs.readdirSync(targetPath);
      paths.forEach(_path => {
        const _targetPath = path.resolve(targetPath, _path);
        if (fs.statSync(_targetPath).isDirectory()) {
          rmdir(_targetPath);
          fs.rmdirSync(_targetPath);
        } else {
          fs.unlinkSync(_targetPath);
        }
      });
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  }
  if (rmdir()) {
    return true;
  } else {
    return false;
  }
  fs.rmdirSync(targetPath)
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
