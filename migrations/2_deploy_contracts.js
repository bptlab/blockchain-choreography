const Arrays = artifacts.require("./Arrays.sol");
const Roles = artifacts.require("./Roles.sol");
const Choreography = artifacts.require("./Choreography.sol");

module.exports = function(deployer) {
  deployer.deploy(Arrays);
  deployer.deploy(Roles);
  deployer.link(Arrays, Choreography);
  deployer.link(Roles, Choreography);
  deployer.deploy(Choreography);
};
