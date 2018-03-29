const Commander = function() {
  this.argvs = [];
  this.commands = [];
  this.callback = [];
  this.options = [];
};

Commander.prototype.option = function(option, cb) {
  this.options.push(option);
  this.callback.push(cb);
  return this;
};
Commander.prototype.command = function(cmd) {
  this.commands.push(cmd);
  return this;
};
Commander.prototype.action = function(cb) {
  const cmd = this.commands.shift();
  const length = cmd.match(/<.+>/).length;
  cb(...this.argvs.slice(length));
  return this;
};
Commander.prototype.parse = function(argvs) {
  this.argvs = argvs.slice(2);
  this.run();
  return this;
};
Commander.prototype.run = function() {
  this.options.forEach((option, index) => {
    option.split(", ").forEach(item => {
      this.argvs.forEach(argv => {
        if (argv === item) {
          const cb = this.callback[index];
          if (typeof cb === "function") {
            cb();
          } else {
            console.log(cb);
          }
        }
      });
    });
  });
};
module.exports = new Commander();
