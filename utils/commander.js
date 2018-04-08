const Commander = function () {
  this.argvs = [];
  this.commands = [];
  this.callback = [];
  this.options = [];
  this.actions = [];
  this.isCatch = false;
  this.catchCallback = () => { };
};

Commander.prototype.option = function (option, cb) {
  this.options.push(option);
  this.callback.push(cb);
  return this;
};

Commander.prototype.command = function (cmd) {
  this.commands.push(cmd);
  return this;
};

Commander.prototype.action = function (fn) {
  const cmd = this.commands.shift();
  const length = cmd.match(/<.+?>/).length;
  this.actions.push(() => {
    if (cmd && this.argvs[0] === cmd.split(" ")[0]) {
      this.isCatch = true;
      if (this.argvs.length > length) {
        fn(...this.argvs.slice(length));
      }
      else {
        fn("app")
      }
    }
  });
  return this;
};

Commander.prototype.catch = function (fn) {
  this.catchCallback = () => {
    if (!this.isCatch) {
      fn(this.argvs);
    }
  };
};

Commander.prototype.parse = function (argvs) {
  this.argvs = argvs.slice(2);
  this.run();
  return this;
};

Commander.prototype.run = function () {
  this.options.forEach((option, index) => {
    option.split(", ").forEach(item => {
      this.argvs.forEach(argv => {
        if (argv === item) {
          const cb = this.callback[index];
          this.isCatch = true;
          if (typeof cb === "function") {
            cb();
          } else {
            console.log(cb);
          }
        }
      });
    });
  });
  this.actions.forEach(action => {
    action();
  });
  this.catchCallback();
};

module.exports = new Commander();
