const DemoContract = artifacts.require("./DemoContract.sol");

module.exports = function(deployer) {
  deployer.deploy(DemoContract);
};
