const Choreography = artifacts.require("./Choreography.sol");

module.exports = function(deployer) {
  deployer.deploy(Choreography);
};
