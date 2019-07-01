var TokenTransfer = artifacts.require("./TokenTransfer.sol");

module.exports = function(deployer) {
  deployer.deploy(TokenTransfer, 10000);
};