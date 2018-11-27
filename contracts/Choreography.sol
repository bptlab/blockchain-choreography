pragma solidity ^0.4.24;

import "./Roles.sol";
import "./Arrays.sol";

contract Choreography {

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
    Roles.Role public reviewers;
    Roles.Role public verifiers;
    Arrays.Address public modelers;
    address public proposer;
    uint16 internal change_number = 0;
    uint public timestamp;

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
    modifier requireVerifier(address sender) {
        require(verifiers.has(sender) == true, "You are not a verifier.");
        _;
    }
    modifier requireReviewer(address sender) {
        require(reviewers.has(sender) == true, "You are not a reviewer.");
        _;
    }

    // SUBMISSION PHASE
    function proposeChange(string _diff)
        external
        isInState(States.READY)
    {
        require(bytes(_diff).length != 0, "You need to send a diff along with your proposal.");

        proposer = msg.sender;
        timestamp = block.timestamp;
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
        reviewers.add(reviewer);
    }

    // VERIFICATION PHASE
    function startVerification()
        external
        isInState(States.SET_REVIEWERS)
        requireProposer(msg.sender)
    {
        state = States.WAIT_FOR_VERIFIERS;
        // TODO Implement logic for assigning verifiers
    }

    function approveReviewers()
        external
        isInState(States.WAIT_FOR_VERIFIERS)
        denyProposer(msg.sender)
        requireVerifier(msg.sender)
    {
        verifiers.approve(msg.sender);
        tryToEndVerification();
    }

    function rejectReviewers()
        external
        isInState(States.WAIT_FOR_VERIFIERS)
        denyProposer(msg.sender)
        requireVerifier(msg.sender)
    {
        verifiers.deny(msg.sender);
        tryToEndVerification();
    }

    function tryToEndVerification()
        private
        isInState(States.WAIT_FOR_VERIFIERS)
    {
        (uint openVotes, uint approveVotes, uint rejectVotes) = verifiers.getVoteDistribution();
        if (openVotes != 0) {
            return;
        }
        if (rejectVotes == 0) {
            state = States.WAIT_FOR_REVIEWERS;
        }
        // TODO: WHAT IF LIST OF REVIEWERS WAS DENIED?
    }

    // REVIEW PHASE
    function approveChange()
        external
        isInState(States.WAIT_FOR_REVIEWERS)
        requireReviewer(msg.sender)
    {
        reviewers.approve(msg.sender);
        tryToEndReview();
    }

    function rejectChange()
        external
        isInState(States.WAIT_FOR_REVIEWERS)
        requireReviewer(msg.sender)
    {
        reviewers.reject(msg.sender);
        tryToEndReview();
    }

    function tryToEndReview()
        internal
        isInState(States.WAIT_FOR_REVIEWERS)
    {
        (uint openVotes, uint approveVotes, uint rejectVotes) = reviewers.getVoteDistribution();
        if (openVotes != 0) {
            return;
        }
        if (rejectVotes == 0) {
            finalizeProposal();
        }
        // TODO: WHAT IF ANYONE REJECTED CHANGE PROPOSAL?
    }

    function finalizeProposal()
        internal
    {
        change_number++;
        verifiers.reset();
        reviewers.reset();
        state = States.READY;
    }
}
