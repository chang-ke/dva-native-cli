module.exports = function help() {
  console.log(
    [
      "",
      "  Usage: dva-native [command] [options]",
      "",
      "",
      "  Commands:",
      "",
      "    init <ProjectName> [options]  generates a new project and installs its dependencies",
      "    new <ProjectName> [options]  generates a new projec",
      "",
      "  Options:",
      "",
      "    -h, --help    output usage information",
      "    -v, --version output the version number",
      ""
    ].join("\n")
  );
};
