require("reflect-metadata");
const jwt = require("jsonwebtoken");
const { container } = require("tsyringe");
const { ConfigService } = require("../dist/service/config");

const [, , userId] = process.argv;

if (!userId) {
  return console.error("Usage: npm run createToken -- <userId>");
}

console.log(jwt.sign({
  userId
}, container.resolve(ConfigService).jwtKey));

