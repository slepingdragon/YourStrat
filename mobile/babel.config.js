// Strip webpack magic comments (e.g. `import(/* webpackIgnore: true */ '...')`).
// Hermes' static parser chokes on these, which breaks `gradlew :app:bundleRelease`
// (preview-apk builds) when a transitive dependency uses them for optional telemetry.
function stripWebpackMagicCommentsPlugin() {
  const MAGIC = /webpackIgnore|webpackChunkName|webpackPrefetch|webpackPreload|webpackMode/;
  const strip = (comments) =>
    comments ? comments.filter((c) => !MAGIC.test(c.value)) : comments;
  return {
    visitor: {
      CallExpression(path) {
        if (path.node.callee.type !== "Import") return;
        path.node.leadingComments = strip(path.node.leadingComments);
        path.node.innerComments = strip(path.node.innerComments);
        path.node.trailingComments = strip(path.node.trailingComments);
        for (const arg of path.node.arguments) {
          arg.leadingComments = strip(arg.leadingComments);
          arg.innerComments = strip(arg.innerComments);
          arg.trailingComments = strip(arg.trailingComments);
        }
      },
    },
  };
}

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxImportSource: "nativewind",
          unstable_transformImportMeta: true,
        },
      ],
      "nativewind/babel",
    ],
    plugins: [stripWebpackMagicCommentsPlugin, "react-native-worklets/plugin"],
  };
};
