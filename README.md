# Negotiating Choreography Models Based on Distributed Ledger Technologies

Blockchain Technology in BPM, Winter Term 2018/2019, Hasso Plattner Institute Potsdam

## Installation

1. (optional) Install a private Blockchain like (Ganache)[https://truffleframework.com/ganache]
1. Install truffle: 
    
    `npm install -g truffle`.
1. Change the `truffle.js` or `truffle-config.json (windows)` according to your ethereum provider.
1. Deploy the requiered smart contracts: 

    ```
    npm run sol
    ```
1. Install dapp dependencies: `npm install`.
1. Deploy the dapp: `npm start`.


## Terminology

**Modeler** - A person who works with the choreography model. He/She can be a proposer, as well as a reviewer, but not both at the same time.

**Proposer** - The person suggesting a new change to the model.

**Reviewer** - A person who has to review a change and approve or reject it.

**Verfifier** - A person whose approval is required for the list of reviewers of a particular change.
