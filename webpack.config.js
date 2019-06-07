const path = require("path");

module.exports = {
  entry: "./src/blackjack-game.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  output: {
    path: path.resolve(__dirname, "lib"),
    filename: "index.js"
  }
};