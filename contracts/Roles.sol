pragma solidity ^0.4.24;

import "./Arrays.sol";

/**
 * @title Roles
 * @dev Library for managing addresses assigned to a Role.
 */
library Roles {

    using Arrays for Arrays.Address;

    enum Vote {
        OPEN,
        APPROVE,
        REJECT
    }

    struct Role {
        mapping (address => Vote) bearers;
        Arrays.Address members;
    }

    /**
     * @dev give an account access to this role
     */
    function add(Role storage _role, address _account) internal {
        _role.members.pushUnique(_account);
        _role.bearers[_account] = Vote.OPEN;
    }

    /**
     * @dev remove an account's access to this role
     */
    function remove(Role storage _role, address _account) internal {
        _role.members.remove(_account);
    }

    /**
     * @dev check if an account has this role
     * @return bool
     */
    function has(Role storage _role, address _account)
        internal
        view
        returns (bool)
    {
        return _role.members.contains(_account);
    }

    function approve(Role storage _role, address _account)
        internal
    {
        _role.bearers[_account] = Vote.APPROVE;
    }

    function reject(Role storage _role, address _account)
        internal
    {
        _role.bearers[_account] = Vote.REJECT;
    }

    function getVoteCount(Role storage _role, Vote _voteType)
        internal
        view
        returns (uint)
    {
        uint votes = 0;
        for (uint ii = 0; ii < _role.members.getLength(); ii++) {
            if (_role.bearers[_role.members.get(ii)] == _voteType) {
                votes++;
            }
        }
        return votes;
    }

    function getVoteDistribution(Role storage _role)
        internal
        view
        returns (uint openVotes, uint approveVotes, uint rejectVotes)
    {
        for (uint ii = 0; ii < _role.members.getLength(); ii++) {
            if (_role.bearers[_role.members.get(ii)] == Vote.OPEN) {
                openVotes++;
            }
            if (_role.bearers[_role.members.get(ii)] == Vote.APPROVE) {
                approveVotes++;
            }
            if (_role.bearers[_role.members.get(ii)] == Vote.REJECT) {
                rejectVotes++;
            }
        }
    }

    /*function getMembersByVote(Role storage _role, Vote _voteType)
        internal
        returns (address[])
    {
        address[] voters = [];
        for (uint ii = 0; ii < _role.members.getLength(); ii++) {
            if (_role.bearers[_role.members.get(ii)] == _voteType) {
                voters.push(_role.members.get(ii));
            }
        }
        return voters;
    }
    */
    function reset(Role storage _role)
        internal
    {
        _role.members.removeAll();
    }

}
