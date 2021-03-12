import webpack from "webpack";
import FriendlyErrorsWebpackPlugin from "friendly-errors-webpack-plugin";
import WebpackDashboard from "webpack-dashboard";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";


class WebpackPlugins {
    async hotModuleReplacementPlugin(webpackConfig) {
        webpackConfig.devServer.hot = true;
        webpackConfig.plugins.push(
            new webpack.HotModuleReplacementPlugin({})
        );
    }

    async progressPlugin(webpackConfig) {
        webpackConfig.plugins.push(
            new webpack.ProgressPlugin((percentage, message, ...args) => {
                //                console.info(percentage, message, ...args);
                let calcPecentage = Math.round(percentage * 100).toString();
                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                process.stdout.write("Compile Progeress: \x1b[33m"+calcPecentage + "% \x1b[0m" + message);
                for(let i = 0; i < args.length; i++){
                    process.stdout.write(" \x1b[90m"+args[i] + "\x1b[0m");
                }
            })
        );
    }

    async webpackDashboard(webpackConfig) {
        webpackConfig.plugins.push(
            new WebpackDashboard()
        );
    }

    async friendlyErrorsWebpackPlugin(webpackConfig) {
        webpackConfig.plugins.push(
            new FriendlyErrorsWebpackPlugin()
        );
    }

    async htmlWebpackPlugin(webpackConfig) {
        webpackConfig.plugins.push(
            new HtmlWebpackPlugin()
        );
    }

    async copyWebpackPlugin(webpackConfig) {
        webpackConfig.plugins.push(
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: "src/static/images",
                        to: "images",
                        noErrorOnMissing: true
                    },
                    {
                        from: "src/static/html",
                        to: "html",
                        noErrorOnMissing: true
                    }
                ],
            })
        );
    }

    async miniCssExtractPlugin(webpackConfig) {
        webpackConfig.plugins.push(
            new MiniCssExtractPlugin({
                filename: "[name].css",
                chunkFilename: "[id].css"
            })
        );
    }

    async providePlugin(webpackConfig) {
        webpackConfig.plugins.push(
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery"
            })
        );
    }
}

export default new WebpackPlugins();
