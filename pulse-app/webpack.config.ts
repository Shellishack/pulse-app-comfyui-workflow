import { ModuleFederationPlugin } from "@module-federation/enhanced/webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import pulseConfig from "./pulse.config";
import { Configuration as WebpackConfig } from "webpack";
import { Configuration as DevServerConfig } from "webpack-dev-server";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { networkInterfaces } from "os";

function getLocalNetworkIP() {
  const interfaces = networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    if (!iface) continue;
    for (const config of iface) {
      if (config.family === "IPv4" && !config.internal) {
        return config.address; // Returns the first non-internal IPv4 address
      }
    }
  }
  return "localhost"; // Fallback
}

const origin = getLocalNetworkIP();

const previewStartupMessage = `
🎉 Your Pulse extension preview \x1b[1m${pulseConfig.displayName}\x1b[0m is LIVE! 

⚡️ Local: http://localhost:3030
⚡️ Network: http://${origin}:3030

✨ Try it out in your browser and let the magic happen! 🚀
`;

const devStartupMessage = `
🎉 Your Pulse extension \x1b[1m${pulseConfig.displayName}\x1b[0m is LIVE! 

⚡️ Local: http://localhost:3001/${pulseConfig.id}/${pulseConfig.version}/
⚡️ Network: http://${origin}:3001/${pulseConfig.id}/${pulseConfig.version}/

✨ Try it out in the Pulse Editor and let the magic happen! 🚀
`;

const previewConfig: WebpackConfig & DevServerConfig = {
  entry: {
    main: "./preview/index.tsx",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./preview/index.html",
    }),
    new MiniCssExtractPlugin({
      filename: "globals.css",
    }),
    {
      apply: (compiler) => {
        let isFirstRun = true;

        // Before build starts
        compiler.hooks.watchRun.tap("ReloadMessagePlugin", () => {
          if (!isFirstRun) {
            console.log("🔄 reloading app...");
          } else {
            console.log("🔄 building app...");
          }
        });

        // After build finishes
        compiler.hooks.done.tap("ReloadMessagePlugin", () => {
          if (isFirstRun) {
            console.log("✅ app is ready");
            console.log(previewStartupMessage);
            isFirstRun = false;
          } else {
            console.log("✅ reload finished");
          }
        });
      },
    },
  ],
  module: {
    rules: [
      { test: /\.tsx?$/, use: "ts-loader" },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
          },
        ],
      },
    ],
  },
  devServer: {
    host: "0.0.0.0",
    allowedHosts: "all",
    port: 3030,
    hot: true, // Enable Hot Module Replacement
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined");
      }

      devServer.app?.use((req, res, next) => {
        if (req.headers.accept && req.headers.accept.includes("text/html")) {
          console.log(`✅ [${req.method}] ${req.url}`);
        }
        next();
      });

      return middlewares;
    },
  },
  mode: "development",
  stats: {
    all: false,
    errors: true,
    warnings: true,
    logging: "warn",
    colors: true,
  },
  infrastructureLogging: {
    level: "warn",
  },
};

const mfConfig: WebpackConfig & DevServerConfig = {
  entry: "./src/main.tsx",
  output: {
    publicPath: "auto",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "globals.css",
    }),
    new ModuleFederationPlugin({
      // Do not use hyphen character '-' in the name
      name: pulseConfig.id,
      filename: "remoteEntry.js",
      exposes: {
        "./main": "./src/main",
      },
      shared: {
        react: {
          requiredVersion: "19.1.0",
          import: "react", // the "react" package will be used a provided and fallback module
          shareKey: "react", // under this name the shared module will be placed in the share scope
          shareScope: "default", // share scope with this name will be used
          singleton: true, // only a single version of the shared module is allowed
        },
        "react-dom": {
          requiredVersion: "19.1.0",
          singleton: true, // only a single version of the shared module is allowed
        },
        // Share Workbox configuration as a module
        "workbox-webpack-plugin": {
          singleton: true,
          requiredVersion: "^7.3.0",
        },
      },
    }),
    {
      apply: (compiler) => {
        let isFirstRun = true;

        // Before build starts
        compiler.hooks.watchRun.tap("ReloadMessagePlugin", () => {
          if (!isFirstRun) {
            console.log("🔄 reloading app...");
          } else {
            console.log("🔄 building app...");
          }
        });

        // After build finishes
        compiler.hooks.done.tap("ReloadMessagePlugin", () => {
          if (isFirstRun) {
            console.log("✅ app is ready");
            console.log(devStartupMessage);
            isFirstRun = false;
          } else {
            console.log("✅ reload finished");
          }
        });
      },
    },
  ],
  module: {
    rules: [
      { test: /\.tsx?$/, use: "ts-loader" },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
          },
        ],
      },
    ],
  },
  stats: {
    all: false,
    errors: true,
    warnings: true,
    logging: "warn",
    colors: true,
  },
  infrastructureLogging: {
    level: "warn",
  },
};

const config = process.env.PREVIEW === "true" ? previewConfig : mfConfig;

export default config;
