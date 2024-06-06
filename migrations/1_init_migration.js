const LaborContract = artifacts.require("LaborContract");

module.exports = function (deployer) {
  deployer.deploy(LaborContract);
};
