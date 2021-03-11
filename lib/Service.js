import path, { dirname } from "path";

import webpack from "webpack";

import WebpackPlugins from "./webpack-config/WebpackPlugins.js";

import WebpackModules from "./webpack-config/WebpackModules.js";

import TerserPlugin from "terser-webpack-plugin";

import CssMinimizerPlugin from "css-minimizer-webpack-plugin";


export default class Service {
    async run(name, args = {}, rawArgv = []) {
        this.mode = args.mode || (name === 'build' ? 'production' : 'development');
        this.isProduction = (this.mode === 'production');

        await this.init();

        await this.webpackConfigInit();

        await this.webpackConfigEntry();

        await this.webpackConfigOutput();

        await WebpackPlugins.progressPlugin(this.webpackConfig);
        await WebpackPlugins.friendlyErrorsWebpackPlugin(this.webpackConfig);
        // await WebpackPlugins.htmlWebpackPlugin(this.webpackConfig);
        await WebpackPlugins.copyWebpackPlugin(this.webpackConfig);
        await WebpackPlugins.miniCssExtractPlugin(this.webpackConfig);

        if (this.mode === 'development') {
            // await WebpackPlugins.hotModuleReplacementPlugin(this.webpackConfig);
            // await WebpackPlugins.webpackDashboard(this.webpackConfig);
        } else {
            await this.webpackConfigOptimization();
        }

        await WebpackModules.css(this.webpackConfig, !this.isProduction);
        await WebpackModules.sass(this.webpackConfig, !this.isProduction);
        await WebpackModules.js(this.webpackConfig, !this.isProduction);
        await WebpackModules.ts(this.webpackConfig, !this.isProduction);
        await WebpackModules.fonts(this.webpackConfig, !this.isProduction, this.fileLoaderOutputPattern);
        await WebpackModules.images(this.webpackConfig, !this.isProduction, this.fileLoaderOutputPattern);

        webpack(this.webpackConfig, this.webpackCallBack);
    }

    async init() {
        this.staticSuffix = "";
        this.fileLoaderOutputPattern = "[name].[ext]" + this.staticSuffix;

        this.appDirectory = path.resolve(path.dirname(""));
        this.moduleDirectory = path.resolve(dirname(import.meta.url), "..");
    }

    async webpackConfigInit() {
        this.webpackConfig = {};
        this.webpackConfig.mode = this.mode;
        this.webpackConfig.context = this.appDirectory;
        this.webpackConfig.resolve = {
            extensions: [".ts", ".tsx", ".js", ".css", ".scss"]
        };
        if (this.mode === "development") {
            this.webpackConfig.devtool = "eval-source-map";
            this.webpackConfig.watch = true;
            this.webpackConfig.watchOptions = {
                ignored: ["**/libraries", "**/node_modules", "**/fonts"],
            };
        }
        this.webpackConfig.devServer = {};
        this.webpackConfig.entry = {};
        this.webpackConfig.output = {};
        this.webpackConfig.plugins = [];
        this.webpackConfig.module = { rules: [] };
    }

    async webpackConfigEntry() {
        this.webpackConfig.entry = {
            critical: {
                import: path.resolve(this.appDirectory, "src/scripts", "critical.ts"),
            },
            app: {
                dependOn: 'critical',
                import: path.resolve(this.appDirectory, "src/scripts", "scripts.ts"),
            },
            cheatsheet: {
                dependOn: 'app',
                import: path.resolve(this.appDirectory, "src/scripts", "cheatsheet.ts"),
            }

        };
    }

    async webpackConfigOutput() {
        this.webpackConfig.output = {
            path: path.resolve(this.appDirectory, "dist"),
            filename: "[name].js",
            chunkFilename: '[name].js'
        };
    }

    async webpackConfigOptimization() {
        this.webpackConfig.optimization = {
            splitChunks: {
                cacheGroups: {
                    vendors: {
                        name: 'chunk-vendors',
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10,
                        chunks: 'initial'
                    },
                    common: {
                        name: 'chunk-common',
                        minChunks: 2,
                        priority: -20,
                        chunks: 'initial',
                        reuseExistingChunk: true
                    }
                }
            },
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    test: /\.m?js(\?.*)?$/i
                }),
                new CssMinimizerPlugin({
                    test: /\.css(\?.*)?$/i
                })
            ]
        };
    }

    webpackCallBack(err, stats) {


        if (err) {
            console.error(err.stack || err);
            if (err.details) {
                console.error(err.details);
            }
            return;
        } else if (stats.hasErrors()) {
            const info = stats.toJson();
            // console.error(info.errors);
        } else {
            const info = stats.toJson();
            if (stats.hasWarnings()) {
                //console.warn(info.warnings);
            }
            const startTime = stats.compilation.startTime;
            const endTime = stats.compilation.endTime;

            const startTimeDate = new Date(startTime);
            const endTimeDate = new Date(endTime);

            const duration = endTime - startTime;
            const durationDate = new Date(duration);

            const durationFormatted = durationDate.getSeconds() + "." + durationDate.getMilliseconds();

            let completionMsg = "\n\x1b[32m";
            completionMsg += "Compile completed in " + durationFormatted + " seconds";
            if (stats.hasWarnings()) {
                completionMsg += " (with warnings)";
            }
            completionMsg += ": ";
            completionMsg += "\x1b[2m";
            completionMsg += startTimeDate.getHours() + ":" + startTimeDate.getMinutes() + ":" + startTimeDate.getSeconds();
            completionMsg += " -> ";
            completionMsg += endTimeDate.getHours() + ":" + endTimeDate.getMinutes() + ":" + endTimeDate.getSeconds();
            completionMsg += "\x1b[0m";


            const assetsInfo = stats.compilation.assetsInfo;
            let assetcounter = 0;

			process.stdout.write("\nstatic assets: ");
			let staticAssetsSeparator = "";
			let staticAssetsCounter = 0;
			for (let [key, value] of assetsInfo) {
				if (value["copied"] || value["sourceFilename"]) {
					// process.stdout.write(staticAssetsSeparator + key);
					// staticAssetsSeparator = " - ";
					staticAssetsCounter++;
				}
			}
			process.stdout.write(staticAssetsCounter.toString());
			process.stdout.write("\n\n");

            for (let [key, value] of assetsInfo) {
                let assetNameColor = "\x1b[32m";
                if (value["copied"]) {
                    assetNameColor = "\x1b[0m";
					continue;
                }
				if (value["sourceFilename"]) {
                    assetNameColor = "\x1b[0m";
					continue;
                }
                let assetMsg = "asset " + assetNameColor + key + "\x1b[0m: ";
                let assetSize = parseInt(value.size);
                let assetUnit = "B";
                let assetSizeColor = "\x1b[90m";
                if (assetSize > 1024) {
                    assetSize = (parseInt(assetSize) / 1024).toFixed(1);
                    assetUnit = "KB";
                    assetSizeColor = "\x1b[96m";
                    if (assetSize > 128) {
                        assetSizeColor = "\x1b[94m";
                    }
                    if (assetSize > 256) {
                        assetSizeColor = "\x1b[33m";
                    }
                    if (assetSize > 512) {
                        assetSizeColor = "\x1b[35m";
                    }
                }
                if (assetSize > 1024) {
                    assetSize = (parseInt(assetSize) / 1024).toFixed(1);
                    assetUnit = "MB";
                    assetSizeColor = "\x1b[31m";
                }
                if (value["copied"]) {
                    assetSizeColor = "\x1b[0m";
                }

                assetMsg += assetSizeColor + assetSize + " " + assetUnit + "\x1b[0m";
                if (value["minimized"]) {
                    assetMsg += " [minimized]";
                }
                if (value["copied"]) {
                    assetMsg += " [copied]";
                }
                if (value["related"]) {
                    assetMsg += " \x1b[90m" + Object.entries(value["related"]).length + " related asset(s)\x1b[0m";
                }
                console.log(assetMsg);
                assetcounter++;
            }

            console.log("Total: " + assetcounter + " assets.");
			console.log(completionMsg);
        }
    }
}
