pragma solidity ^0.4.24;

import "./Roles.sol";
import "./Persons.sol";

contract Choreography {

    using Roles for Roles.Role;
    using Persons for Persons.Person;

    enum States {
        READY,                 // 0 (default) | Aenderungsset kann gepushed werden
        SET_REVIEWERS,         // 1 |
        WAIT_FOR_VERIFIERS,    // 2
        WAIT_FOR_REVIEWERS,    // 3
        REJECTED               // 4
    }

    // storage variables
    States public state = States.READY;
    string public title;
    string public diff;
    bytes32 public id;
    Roles.Role private reviewers;
    Roles.Role private verifiers;
    Persons.Person private modelers;
    address public proposer;
    uint16 internal change_number = 0;
    uint public timestamp;

    //events
    event LogNewModeler(
        address indexed _newModeler,
        address indexed _inviter,
        uint _timestamp
    );

    event LogNewChange(
        bytes32 indexed _id,
        address indexed _proposer,
        uint _timestamp
    );

    event LogVerificationStarted(
        bytes32 indexed _id,
        address indexed _proposer,
        uint _timestamp
    );

    event LogVerificationDone(
        bytes32 indexed _id,
        bool _success,
        uint _timestamp
    );

    event LogReviewStarted(
        bytes32 indexed _id,
        uint _timestamp
    );

    event LogReviewGiven(
        bytes32 indexed _id,
        address indexed _reviewer,
        bool _approved,
        uint _timestamp
    );

    event LogVoteDistribution(
        bytes32 indexed _id,
        uint _pending,
        uint _approvals,
        uint _rejections,
        uint _timestamp
    );

    event LogReviewDone(
        bytes32 indexed _id,
        bool _approved,
        uint _timestamp
    );

    event LogNewCounterproposal(
        bytes32 indexed _id,
        address indexed _proposer,
        uint _timestamp
    );

    event LogProposalProcessed(
        bytes32 indexed _id,
        bool _approved,
        uint _timestamp
    );

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

    modifier requireVerifier(address _sender) {
        require(verifiers.has(_sender) == true, "You are not a verifier.");
        _;
    }

    modifier requireReviewer(address _sender) {
        require(reviewers.has(_sender) == true, "You are not a reviewer.");
        _;
    }

    modifier requireModeler(address _sender) {
        require(modelers.isRegistered(_sender) == true, "You are not a modeler in this diagram.");
        _;
    }

    constructor(string _username, string _email)
        public
    {
        modelers.add(msg.sender, _username, _email);
    }

    function addModeler(address _modeler, string _username, string _email)
        external
        requireModeler(msg.sender)
        returns (bool)
    {
        if (modelers.add(_modeler, _username, _email)) {
            emit LogNewModeler(_modeler, msg.sender, now);
            return true;
        }
        return false;
    }

    function getModelerUsername(address _modeler)
        external
        view
        requireModeler(_modeler)
        returns (string)
    {
        return modelers.getUsername(_modeler);
    }

    function getModelerEmail(address _modeler)
        external
        view
        requireModeler(_modeler)
        returns (string)
    {
        return modelers.getEmailAddress(_modeler);
    }

    function getModelerAddress(string _username)
        external
        view
        returns (address)
    {
        return modelers.getAddressByUsername(_username);
    }

    // SUBMISSION PHASE
    function proposeChange(string _title, string _diff)
        external
        isInState(States.READY)
    {
        require(bytes(_title).length != 0, "You need to send a title along with your proposal.");
        require(bytes(_diff).length != 0, "You need to send a diff along with your proposal.");

        proposer = msg.sender;
        timestamp = block.timestamp;
        id = keccak256(abi.encodePacked(block.timestamp, change_number, proposer));
        title = _title;
        diff = _diff;
        state = States.SET_REVIEWERS;
        emit LogNewChange(id, proposer, now);
    }

    function addReviewer(address _reviewer)
        external
        isInState(States.SET_REVIEWERS)
        requireProposer(msg.sender)
    {
        reviewers.add(_reviewer);
    }

    // VERIFICATION PHASE
    function startVerification()
        external
        isInState(States.SET_REVIEWERS)
        requireProposer(msg.sender)
    {
        // TODO Implement logic for assigning verifiers
        emit LogVerificationStarted(id, proposer, now);
        state = States.WAIT_FOR_VERIFIERS;
        tryToEndVerification();
    }

    function approveReviewers()
        external
        isInState(States.WAIT_FOR_VERIFIERS)
        //denyProposer(msg.sender)
        requireVerifier(msg.sender)
    {
        verifiers.approve(msg.sender);
        tryToEndVerification();
    }

    function rejectReviewers()
        external
        isInState(States.WAIT_FOR_VERIFIERS)
        //denyProposer(msg.sender)
        requireVerifier(msg.sender)
    {
        verifiers.reject(msg.sender);
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
            emit LogVerificationDone(id, true, now);
            emit LogReviewStarted(id, now);
        }
        else {
            emit LogVerificationDone(id, false, now);
            // TODO: WHAT IF LIST OF REVIEWERS WAS DENIED?
        }
    }

    // REVIEW PHASE
    function approveChange()
        external
        isInState(States.WAIT_FOR_REVIEWERS)
        requireReviewer(msg.sender)
    {
        reviewers.approve(msg.sender);
        emit LogReviewGiven(id, msg.sender, true, now);
        tryToEndReview();
    }

    function rejectChange()
        external
        isInState(States.WAIT_FOR_REVIEWERS)
        requireReviewer(msg.sender)
    {
        reviewers.reject(msg.sender);
        emit LogReviewGiven(id, msg.sender, false, now);
        tryToEndReview();
    }

    function tryToEndReview()
        internal
        isInState(States.WAIT_FOR_REVIEWERS)
    {
        (uint openVotes, uint approveVotes, uint rejectVotes) = reviewers.getVoteDistribution();
        emit LogVoteDistribution(id, openVotes, approveVotes, rejectVotes, now);
        if (openVotes != 0) {
            return;
        }
        if (rejectVotes == 0) {
            emit LogReviewDone(id, true, now);
            finalizeProposal();
        }
        else {
            emit LogReviewDone(id, false, now);
            // TODO: WHAT IF ANYONE REJECTED CHANGE PROPOSAL?
        }
    }

    // CONTER PROPOSAL
    function proposeConterproposal(string _diff)
        external
        isInState(States.WAIT_FOR_REVIEWERS)
    {
        require(bytes(_diff).length != 0, "You need to send a diff along with your counterproposal.");

        reviewers.add(proposer);
        reviewers.remove(msg.sender);

        proposer = msg.sender;
        timestamp = block.timestamp;
        diff = _diff;
        state = States.WAIT_FOR_REVIEWERS;
        emit LogNewCounterproposal(id, proposer, now);
    }

    function finalizeProposal()
        internal
    {
        emit LogProposalProcessed(id, true, now);
        change_number++;
        verifiers.reset();
        reviewers.reset();
        state = States.READY;
    }
}
