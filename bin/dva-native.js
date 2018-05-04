#! /usr/bin/env node
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const help = require('./helper');
const shell = require('shelljs');
const colors = require('colors');
const cwdPath = process.cwd();
const package = require('../package.json');
const templatePath = path.resolve(__dirname, '../template');
const program = require('../utils/commander');

const Regx = (() => {
  let regstr = '';
  /**
   * 二进制文件后缀，在rename的时候用来过滤
   */
  ['png', 'jpg', 'jpeg', 'jar', 'gif'].forEach(e => {
    regstr += e + '|';
  });
  regstr = `\.(${regstr.slice(0, -1)})`
  return new RegExp(regstr);
})();

function removeGit() {
  shell.rm('-rf', path.join(cwdPath, 'react-native-dva-starter/.git'), error => {
    if (error) {
      console.log(err);
    }
  });
}

/**
 *
 *
 * @param {string} path
 * @returns {boolean} 路径是否存在
 */
function fsExistsSync(path) {
  try {
    fs.accessSync(path, fs.F_OK);
  } catch (e) {
    return false;
  }
  return true;
}

function copyFile(templatePath, targetPath) {
  fs.writeFileSync(targetPath, fs.readFileSync(templatePath));
}

function confirmOverride() {
  const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve, reject) => {
    terminal.question('Floder is already exits, do you want override it ? yes/no ', answer => {
      if (answer === 'yes' || answer === 'y') {
        resolve(true);
        terminal.close();
      } else {
        process.exit();
      }
    });
  });
}

function copyTemplate(templatePath, targetPath) {
  try {
    if (fs.statSync(templatePath).isDirectory() && !fsExistsSync(targetPath)) {
      fs.mkdirSync(targetPath);
    }
    const subpaths = fs.readdirSync(templatePath);
    subpaths.forEach(subpath => {
      const tarPath = path.resolve(targetPath, subpath);
      const tempPath = path.resolve(templatePath, subpath);
      console.log('creating...' + tarPath);
      if (fs.statSync(tempPath).isDirectory()) {
        copyTemplate(tempPath, tarPath);
      } else {
        copyFile(tempPath, tarPath);
      }
    });
  } catch (error) {
    console.log(error);
    return false;
  }
  return true;
}

function renameProject(targetPath, projectName) {
  try {
    const paths = fs.readdirSync(targetPath);
    paths.forEach(subpath => {
      const subfile = path.resolve(targetPath, subpath);
      const newPath = subfile.replace(/DvaStarter/gim, projectName);
      if (!fs.statSync(subfile).isFile()) {
        if (subpath !== 'images') {
          fs.renameSync(subfile, newPath);
          renameProject(newPath, projectName);
        }
      } else {
        if (!Regx.test(subfile)) {
          fs.renameSync(subfile, newPath);
          fs.writeFileSync(
            newPath,
            fs
              .readFileSync(newPath)
              .toString()
              .replace(/DvaStarter/gim, projectName)
          );
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
}

function installDependencies(projectName) {
  console.log('\ninstalling...');
  if (shell.exec(`cd ${projectName} && npm install --registry=http://registry.cnpmjs.org`).code) {
    if (shell.exec(`cd ${projectName} && npm install`).code) {
      console.log(colors.red('install dependencies failed!'));
    } else {
      console.log(
        colors.yellow(
          [
            `Success! Created ${projectName} at ${cwdPath}.`,
            'Inside that directory, you can run several commands and more:',
            '  * npm start: Starts you project.',
            '  * npm test: Run test.',
            'We suggest that you begin by typing:',
            `  cd ${projectName}`,
            '  npm start',
            'Happy hacking!'
          ].join('\n')
        )
      );
    }
  }
}

function backupDir(templatePath, backupPath) {
  if (fs.statSync(templatePath).isDirectory()) {
    fs.mkdirSync(backupPath);
  }
  const subpaths = fs.readdirSync(templatePath);
  subpaths.forEach(subpath => {
    const bacPath = path.resolve(backupPath, subpath);
    const tempPath = path.resolve(templatePath, subpath);
    if (fs.statSync(tempPath).isDirectory()) {
      backupDir(tempPath, bacPath);
    } else {
      copyFile(tempPath, bacPath);
    }
  });
}

function removeBackup(backupPath) {
  shell.rm('-rf', backupPath);
}

function newLatestProject(projectName) {
  shell.exec(`git clone https://github.com/nihgwu/react-native-dva-starter.git`, error => {
    if (!error) {
      const tarPath = path.join(cwdPath, 'react-native-dva-starter');
      removeGit();
      renameProject(tarPath, projectName);
      fs.renameSync(tarPath, projectName);
      installDependencies(projectName);
    } else {
      console.log(error);
    }
  });
}

async function newProject(projectName) {
  const targetPath = `${cwdPath}/${projectName}`;
  const backupPath = `${cwdPath}/.${projectName}`;
  if (fsExistsSync(targetPath)) {
    if (await confirmOverride()) {
      //fs.renameSync(targetPath, backupPath);
      if (copyTemplate(templatePath, targetPath)) {
        renameProject(targetPath, projectName);
        installDependencies(projectName);
      }
      //removeBackup(backupPath);
    }
  } else {
    if (copyTemplate(templatePath, targetPath)) {
      renameProject(targetPath, projectName);
      installDependencies(projectName);
    }
  }
}

try {
  program.option('-h, --help', help).option('-v, --version', () => {
    console.log(package.version);
  });
  program.command('new <project>').action(newProject);
  program.command('git <project>').action(newLatestProject);
  program.catch((...argvs) => {
    console.log(colors.red(`Do not use dva-native ${argvs}`));
    console.log('Run ' + colors.blue('dva-native --help') + ' to get the Commands that dva-native-cli supports');
  });
  program.parse(process.argv);
} catch (error) {
  console.log(error);
}
