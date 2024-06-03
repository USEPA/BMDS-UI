const path = require("path"),
    BundleTracker = require("webpack-bundle-tracker");

module.exports = {
    context: __dirname,

    entry: {
        main: ["./src/index"],
    },

    externals: {
        $: "$",
    },

    mode: "production",

    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        plugins: [["@babel/plugin-proposal-class-properties", {loose: false}]],
                    },
                },
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader"},
            {test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader"},
        ],
    },

    output: {
        filename: "[name].[contenthash].js",
        chunkFilename: "[name].[contenthash].js",
        path: path.resolve("../bmds_ui/static/bundles"),
        publicPath: "/static/bundles/",
    },

    plugins: [
        new BundleTracker({
            path: path.resolve(__dirname, "../bmds_ui"),
            filename: "webpack-stats.json",
        }),
    ],

    resolve: {
        roots: [path.join(__dirname, "src")],
        alias: {
            "@": path.join(__dirname, "src"),
        },
    },
};
