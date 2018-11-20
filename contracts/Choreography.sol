pragma solidity ^0.4.24;

import "./Roles.sol";

contract Choreography {
    using Roles for Roles.Role;
    enum States {
        READY,                 // 0 (default) | Aenderungsset kann gepushed werden
        SET_REVIEWERS,         // 1 |
        WAIT_FOR_VERIFIERS,    // 2
        WAIT_FOR_REVIEWERS,    // 3
        REJECTED               // 4
    }

    // storage variables
    States public state = States.READY;
    string public diff;
    bytes32 public id;
    address[] public reviewers;
    address public proposer;
    uint16 internal change_number = 0;

    // modifiers
    modifier isInState(States _targetState) {
        require(state == _targetState, "This action is not allowed in this state.");
        _;
    }
    modifier requireProposer(address _sender) {
        require(_sender == proposer, "Only the proposer can perform this action.");
        _;
    }
    modifier denyProposer(address _sender) {
        require(_sender != proposer, "The proposer is not allowed to perform this action.");
        _;
    }
    /*modifier requireReviewer(address sender) {
        require(reviewer_states[sender] == true, "You are not a reviewer or have already reacted to this proposal.");
        _;
    }*/

    // external functions
    function proposeChange(string _diff)
        external
        isInState(States.READY)
    {
        require(bytes(_diff).length != 0, "You need to send a diff along with your proposal.");

        proposer = msg.sender;
        id = keccak256(abi.encodePacked(block.timestamp, change_number, proposer));
        diff = _diff;
        state = States.SET_REVIEWERS;
    }

    function addReviewer(address reviewer)
        external
        isInState(States.SET_REVIEWERS)
        requireProposer(msg.sender)
    {
        // Add reviewer to list of required reviewers
        reviewers.push(reviewer);
    }

    function startVerification()
        external
        isInState(States.SET_REVIEWERS)
        requireProposer(msg.sender)
    {
        // Start verification phase
        state = States.WAIT_FOR_VERIFIERS;
    }

    function verificateListOfReviewers()
        external
        isInState(States.WAIT_FOR_VERIFIERS)
        denyProposer(msg.sender)
    {

        state = States.WAIT_FOR_REVIEWERS;
    }

    function validateApprove()
        external
        isInState(States.WAIT_FOR_REVIEWERS)
        returns(bool)
    {
        for (uint16 ii = 0; ii < reviewers.length; ii++) {
            if (reviewers[ii] == msg.sender) {
                removeReviewer(ii);
                approveChange();
                return true;
            }
        }
        return false;
    }

    function validateReject()
        external
        isInState(States.WAIT_FOR_REVIEWERS)
    {
        rejectChange();
    }


    function approveChange()
        internal
    {
        if (reviewers.length == 0) {
            startNewRound();
        }
    }

    function rejectChange()
        internal
    {
        state = States.REJECTED;
    }

    function removeReviewer(uint16 index)
        internal
    {
        if (index >= reviewers.length) return;
        reviewers[index] = reviewers[reviewers.length-1];
        delete reviewers[reviewers.length-1];
        reviewers.length--;
    }

    function startNewRound()
        internal
    {
        if (reviewers.length != 0) {
            reviewers.length = 0;
        }
        change_number++;
        state = States.READY;
    }
}
