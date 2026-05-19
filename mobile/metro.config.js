const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { enhanceWithApiProxy } = require("./dev-api-proxy");

const config = getDefaultConfig(__dirname);

let finalConfig = withNativeWind(config, { input: "./global.css" });

// NativeWind replaces enhanceMiddleware; chain API proxy after it so /api runs first.
const nativeWindEnhance = finalConfig.server?.enhanceMiddleware;
finalConfig = {
  ...finalConfig,
  server: {
    ...finalConfig.server,
    enhanceMiddleware: (middleware, metroServer) => {
      const inner = nativeWindEnhance
        ? nativeWindEnhance(middleware, metroServer)
        : middleware;
      return enhanceWithApiProxy(inner);
    },
  },
};

module.exports = finalConfig;
