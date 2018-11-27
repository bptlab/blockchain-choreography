const Roles = artifacts.require("./Roles.sol");
const Choreography = artifacts.require("./Choreography.sol");

module.exports = function(deployer) {
  deployer.deploy(Roles);
  deployer.link(Roles, Choreography);
  deployer.deploy(Choreography);
};
