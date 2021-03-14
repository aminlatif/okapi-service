import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

class WebpackModules {

    async jquery(webpackConfig, addSourceMap = false) {
        webpackConfig.module.rules.push({
            test: require.resolve("jquery"),
                loader: "expose-loader",
            options: {
                exposes: ["jQuery"],
            }
        });
    }

    async css(webpackConfig, addSourceMap = false) {
        webpackConfig.module.rules.push({
            test: /\.css$/,
            use: [
                addSourceMap ? "style-loader" : MiniCssExtractPlugin.loader,
                {
                    loader: "css-loader",
                    options: {
                        sourceMap: addSourceMap,
                    },
                },
                {
                    loader: "postcss-loader",
                    options: {
                        sourceMap: addSourceMap,
                        postcssOptions: {
                            plugins: [
                                [
                                    "autoprefixer",
                                    {},
                                ],
                            ],
                        },
                    },
                },
            ],
        })
    }

    async sass(webpackConfig, addSourceMap = false) {

        webpackConfig.module.rules.push({
            test: /\.scss$/,
            use: [
                addSourceMap ? "style-loader" : MiniCssExtractPlugin.loader,
                {
                    loader: "css-loader",
                    options: {
                        sourceMap: addSourceMap,
                        modules: {compileType: "icss"}
                    },
                },
                {
                    loader: "postcss-loader",
                    options: {
                        sourceMap: addSourceMap,
                        postcssOptions: {
                            plugins: [
                                [
                                    "autoprefixer",
                                    {},
                                ],
                            ],
                        },
                    },
                },
                {
                    loader: "sass-loader",
                    options: {
                        sourceMap: addSourceMap,
                        sassOptions: {
                            includePaths: [
                                "src/styles"
                            ]
                        }
                    },
                },
            ],
        })
    }

    async js(webpackConfig, addSourceMap = false) {
        webpackConfig.module.rules.push({
            test: /\.js$/,
            use: [
                {
                    loader: "babel-loader"
                }
            ],
            exclude: "/node_modules/",
        })
    }

    async ts(webpackConfig, addSourceMap = false) {
        webpackConfig.module.rules.push({
            test: /\.ts?$/,
            use: [
                {
                    loader: "ts-loader"
                }
            ],
            exclude: "/node_modules/",
        })
    }

    async fonts(webpackConfig, addSourceMap = false, fileLoaderOutputPattern = "[name].[ext]") {
        webpackConfig.module.rules.push({
            test: /\.(woff(2)?|ttf|eot|otf)(\?v=\d+\.\d+\.\d+)?$/,
            use: [
                {
                    loader: "file-loader",
                    options: {
                        name: fileLoaderOutputPattern,
                        outputPath: "fonts/",
                    },
                },
            ],
        })
    }

    async images(webpackConfig, addSourceMap = false, fileLoaderOutputPattern = "[name].[ext]") {
        webpackConfig.module.rules.push({
            test: /\.(jpg|jpeg|jp2|jpg2|png|webp|svg|gif)$/,
            use: [
                {
                    loader: "file-loader",
                    options: {
                        name: fileLoaderOutputPattern,
                        outputPath: "images/",
                    },
                },
            ],
        })
    }

}

export default new WebpackModules();
