import fs from "node:fs";
import path from "node:path";
import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";
import {viteExternalsPlugin} from "vite-plugin-externals";

const outDir = "../bmds_ui/static/bundles";

export default defineConfig({
    root: ".",
    base: "/static/bundles",
    plugins: [
        react({
            babel: {
                presets: [
                    [
                        "@babel/preset-react",
                        {
                            runtime: "classic",
                            importSource: undefined,
                        },
                    ],
                ],
                plugins: [
                    ["@babel/plugin-proposal-decorators", {legacy: true}],
                    ["@babel/plugin-proposal-class-properties", {loose: false}],
                ],
            },
        }),
        viteExternalsPlugin({
            $: "$",
        }),
        {
            name: "create-empty-gitkeep",
            closeBundle() {
                const dest = path.resolve(__dirname, outDir, ".gitkeep");
                fs.writeFileSync(dest, "");
            },
        },
    ],
    build: {
        outDir,
        emptyOutDir: true,
        manifest: true,
        rollupOptions: {
            input: {
                main: "src/index.js",
            },
            output: {
                manualChunks: function manualChunks(id) {
                    if (id.includes("node_modules")) {
                        if (id.includes("plotly")) {
                            return "plotly";
                        }
                        if (id.includes("react") || id.includes("mobx") || id.includes("quill")) {
                            return "ui";
                        }
                        return "vendor";
                    }
                    return null;
                },
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    server: {
        port: 8150,
        host: "0.0.0.0",
        strictPort: true,
        cors: true,
        hmr: true,
    },
    optimizeDeps: {
        include: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
        esbuildOptions: {
            loader: {
                ".js": "jsx",
            },
        },
    },
    esbuild: {
        loader: "jsx",
        include: /.*\.jsx?$/,
        exclude: [],
    },
});
