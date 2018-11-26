pragma solidity ^0.4.24;

import "./Arrays.sol";

/**
 * @title Roles
 * @dev Library for managing addresses assigned to a Role.
 */
library Roles {

    enum Vote {
        OPEN,
        APPROVE,
        REJECT
    }

    struct Role {
        mapping (address => Vote) bearer;
        Arrays.Address members;
    }

    /**
     * @dev give an account access to this role
     */
    function add(Role storage _role, address _account) internal {
        _role.members.pushUnique(_account);
        _role.bearer[_account] = Vote.OPEN;
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
            if (_role.bearers[_role.members[ii]] == _voteType) {
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
            if (_role.bearers[_role.members[ii]] == Vote.OPEN) {
                openVotes++;
            }
            if (_role.bearers[_role.members[ii]] == Vote.APPROVE) {
                approveVotes++;
            }
            if (_role.bearers[_role.members[ii]] == Vote.REJECT) {
                rejectVotes++;
            }
        }
    }

    function getMembersByVote(Role storage _role, Vote _voteType)
        internal
        returns (address[])
    {
        address[] voters = [];
        for (uint ii = 0; ii < _role.members.getLength(); ii++) {
            if (_role.bearers[_role.members[ii]] == _voteType) {
                voters.push(_role.members[ii]);
            }
        }
        return voters;
    }

    function reset(Role storage _role)
        internal
    {
        _role.members.removeAll();
    }

}


/*

BASED ON

The MIT License (MIT)

Copyright (c) 2016 Smart Contract Solutions, Inc.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/access/Roles.sol
https://openzeppelin.org/api/docs/learn-about-access-control.html

*/
