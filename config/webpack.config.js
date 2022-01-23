const path = require('path');

const PACKAGE_NAME = '@lechelt/react-financial-charts';

module.exports = {
    entry: path.resolve(__dirname, '../src/index.ts'),
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: "index.js",
        libraryTarget: 'umd',
        library: PACKAGE_NAME,
        umdNamedDefine: true,
        globalObject: 'this',
    },
    resolve: {
        extensions: [".js", ".jsx", ".json", ".ts", ".tsx"]
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                loader: "ts-loader",
                options: {
                    configFile: path.resolve(__dirname, '../tsconfig.json')
                }
            }
        ]
    },
    watch: true
}