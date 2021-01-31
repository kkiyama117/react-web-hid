module.exports = {
  mode: process.env.NODE_ENV,
  devtool: 'source-map',
  externals: [
    {
      react: {
        root: "React",
        commonjs2: "react",
        commonjs: "react",
        amd: "react"
      },
      "react-dom": {
        root: "ReactDOM",
        commonjs2: "react-dom",
        commonjs: "react-dom",
        amd: "react-dom"
      }
    }
  ],
  entry: "./src/react-web-hid.tsx",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  module: {
    rules: [
      {
        test: /\.([tj])sx?$/,
        use: "awesome-typescript-loader"
      }
    ]
  },
  output: {
    library: "Webhid",
    libraryTarget: "umd",
    filename:
    process.env.NODE_ENV === "production"
    ? "react-web-hid.min.js"
    : "react-web-hid.js",
    globalObject: "this",
    libraryExport: "default"
  }
};
