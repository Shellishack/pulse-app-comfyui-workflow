import { ModuleFederationPlugin } from "@module-federation/enhanced/webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import pulseConfig from "./pulse.config";
import { webpack, Configuration as WebpackConfig } from "webpack";
import { Configuration as DevServerConfig } from "webpack-dev-server";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { networkInterfaces } from "os";
import { NodeFederationPlugin } from "@module-federation/node";
import path from "path";
import { globSync } from "glob";
import fs from "fs";
import CopyWebpackPlugin from "copy-webpack-plugin";

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

⚡️ Local: http://localhost:3030/${pulseConfig.id}/${pulseConfig.version}/
⚡️ Network: http://${origin}:3030/${pulseConfig.id}/${pulseConfig.version}/

✨ Try it out in the Pulse Editor and let the magic happen! 🚀
`;

const previewClientConfig: WebpackConfig & DevServerConfig = {
  entry: {
    main: "./preview/frontend/index.tsx",
  },
  output: {
    path: path.resolve(__dirname, "dist/client"),
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./preview/frontend/index.html",
    }),
    new MiniCssExtractPlugin({
      filename: "globals.css",
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "src/assets", to: "assets" }],
    }),
    {
      apply: (compiler) => {
        let isFirstRun = true;

        // Before build starts
        compiler.hooks.watchRun.tap("ReloadMessagePlugin", () => {
          if (!isFirstRun) {
            console.log("[client-preview] 🔄 Reloading app...");
          } else {
            console.log("[client-preview] 🔄 Building app...");
          }
        });

        // After build finishes
        compiler.hooks.done.tap("ReloadMessagePlugin", () => {
          if (isFirstRun) {
            console.log("[client-preview] ✅ Successfully built preview.");
            console.log(previewStartupMessage);
            isFirstRun = false;
          } else {
            console.log("[client-preview] ✅ Reload finished");
          }
        });
      },
    },
  ],
  watchOptions: {
    ignored: /src\/server-function/,
  },
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

/* This is temporary code to be moved to a different package in the future. */
const previewHostConfig: WebpackConfig = {
  entry: "./preview/backend/index.ts",
  target: "async-node",
  output: {
    publicPath: "auto",
    library: { type: "commonjs-module" },
    path: path.resolve(__dirname, "dist/preview/backend"),
    filename: "index.cjs",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: false, // Enables type-checking and .d.ts file emission
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new NodeFederationPlugin(
      {
        remoteType: "script",
        name: "preview_host",
        useRuntimePlugin: true,
        exposes: {},
      },
      {}
    ),
  ],
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

const mfClientConfig: WebpackConfig & DevServerConfig = {
  name: "client",
  entry: "./src/main.tsx",
  output: {
    publicPath: "auto",
    path: path.resolve(__dirname, "dist/client"),
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "globals.css",
    }),
    // Copy assets to dist
    new CopyWebpackPlugin({
      patterns: [{ from: "src/assets", to: "assets" }],
    }),
    new ModuleFederationPlugin({
      // Do not use hyphen character '-' in the name
      name: pulseConfig.id,
      filename: "remoteEntry.js",
      exposes: {
        "./main": "./src/main.tsx",
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
        if (compiler.options.mode === "development") {
          let isFirstRun = true;

          // Before build starts
          compiler.hooks.watchRun.tap("ReloadMessagePlugin", () => {
            if (!isFirstRun) {
              console.log("[client] 🔄 reloading app...");
            } else {
              console.log("[client] 🔄 building app...");
            }
          });

          // Log file updates
          compiler.hooks.invalid.tap("LogFileUpdates", (file, changeTime) => {
            console.log(
              `[watch] change detected in: ${file} at ${new Date(
                changeTime || Date.now()
              ).toLocaleTimeString()}`
            );
          });

          // After build finishes
          compiler.hooks.done.tap("ReloadMessagePlugin", () => {
            if (isFirstRun) {
              console.log("[client] ✅ Successfully built client.");
              console.log(devStartupMessage);
              isFirstRun = false;
            } else {
              console.log("[client] ✅ Reload finished.");
            }
          });
        } else {
          // Print build success/failed message
          compiler.hooks.done.tap("BuildMessagePlugin", (stats) => {
            if (stats.hasErrors()) {
              console.log(`[client] ❌ Failed to build client.`);
            } else {
              console.log(`[client] ✅ Successfully built client.`);
            }
          });
        }
      },
    },
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: [/node_modules/, /dist/],
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
          },
        ],
        exclude: [/node_modules/, /dist/],
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

function discoverServerFunctions() {
  // Get all .ts files under src/server-function and read use default exports as entry points
  const files = globSync("./src/server-function/**/*.ts");
  const entryPoints = files
    .map((file) => file.replaceAll("\\", "/"))
    .map((file) => {
      return {
        ["./" + file.replace("src/server-function/", "").replace(/\.ts$/, "")]:
          "./" + file,
      };
    })
    .reduce((acc, curr) => {
      return { ...acc, ...curr };
    }, {});

  return entryPoints;
}

function makeNodeFederationPlugin() {
  const funcs = discoverServerFunctions();

  console.log(`Discovered server functions:
${Object.entries(funcs)
  .map(([name, file]) => {
    return `  - ${name} (from ${file})`;
  })
  .join("\n")}
`);

  return new NodeFederationPlugin(
    {
      name: pulseConfig.id + "_server",
      remoteType: "script",
      useRuntimePlugin: true,
      library: { type: "commonjs-module" },
      filename: "remoteEntry.js",
      exposes: {
        ...funcs,
      },
    },
    {}
  );
}

function compileServerFunctions(compiler) {
  // Remove existing entry points
  try {
    fs.rmSync("dist/server", { recursive: true, force: true });
  } catch (e) {
    console.error("Error removing dist/server:", e);
    console.log("Continuing...");
  }

  // Run a new webpack compilation to pick up new server functions
  const options = {
    ...compiler.options,
    watch: false,
    plugins: [
      // Add a new NodeFederationPlugin with updated entry points
      makeNodeFederationPlugin(),
    ],
  };
  const newCompiler = webpack(options);

  // Run the new compiler
  newCompiler?.run((err, stats) => {
    if (err) {
      console.error(`${getServerName()} ❌ Error during recompilation:`, err);
    } else if (stats?.hasErrors()) {
      console.error(
        `${getServerName()} ❌ Compilation errors:`,
        stats.toJson().errors
      );
    } else {
      console.log(
        `${getServerName()} ✅ Compiled server functions successfully.`
      );
    }
  });
}

function getServerName() {
  return process.env.PREVIEW === "true" ? "[server-preview]" : "[server]";
}

const mfServerConfig: WebpackConfig = {
  name: "server",
  entry: {},
  target: "async-node",
  output: {
    publicPath: "auto",
    path: path.resolve(__dirname, "dist/server"),
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [
    {
      apply: (compiler) => {
        if (compiler.options.mode === "development") {
          let isFirstRun = true;

          // Before build starts
          compiler.hooks.watchRun.tap("ReloadMessagePlugin", () => {
            if (!isFirstRun) {
              console.log(`${getServerName()} 🔄 Reloading app...`);
            } else {
              console.log(`${getServerName()} 🔄 Building app...`);
            }

            compileServerFunctions(compiler);
          });

          // After build finishes
          compiler.hooks.done.tap("ReloadMessagePlugin", () => {
            if (isFirstRun) {
              console.log(`${getServerName()} ✅ Successfully built server.`);
              isFirstRun = false;
            } else {
              console.log(`${getServerName()} ✅ Reload finished.`);
            }
          });

          // Watch for changes in the server-function directory to trigger rebuilds
          compiler.hooks.thisCompilation.tap(
            "WatchServerFunctions",
            (compilation) => {
              compilation.contextDependencies.add(
                path.resolve(__dirname, "src/server-function")
              );
            }
          );
        } else {
          // Print build success/failed message
          compiler.hooks.done.tap("BuildMessagePlugin", (stats) => {
            if (stats.hasErrors()) {
              console.log(`${getServerName()} ❌ Failed to build server.`);
            } else {
              compileServerFunctions(compiler);
              console.log(`${getServerName()} ✅ Successfully built server.`);
            }
          });
        }
      },
    },
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: [/node_modules/, /dist/],
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

const config =
  process.env.PREVIEW === "true"
    ? [previewClientConfig, previewHostConfig, mfServerConfig]
    : [mfClientConfig, mfServerConfig];

export default config as WebpackConfig[];
