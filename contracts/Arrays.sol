pragma solidity ^0.4.24;

/**
 * @title Arrays
 * @dev Library extending the array functions.
 */
library Arrays {
    struct Address {
        address[] addresses;
    }

    modifier notEmpty(address _address) {
        require(_address != address(0), "Not a valid address.");
        _;
    }

    function push(Address storage _addresses, address _account)
        internal
        notEmpty(_account)
    {
        _addresses.addresses.push(_account);
    }

    function pushUnique(Address storage _addresses, address _account)
        internal
        notEmpty(_account)
        returns(bool)
    {
        for (uint16 ii = 0; ii < _addresses.addresses.length; ii++) {
            if (_addresses.addresses[ii] == _account) {
                return false;
            }
        }
        _addresses.addresses.push(_account);
        return true;
    }

    function removeAll(Address storage _addresses)
        internal
    {
        _addresses.addresses.length = 0;
    }

    function remove(Address storage _addresses, address _account)
        internal
        notEmpty(_account)
    {
        (uint16 accountIndex, bool isIn) = indexOf(_addresses, _account);
        if (!isIn) {
            return;
        }
        _addresses.addresses[accountIndex] = _addresses.addresses[_addresses.addresses.length-1];
        delete _addresses.addresses[ _addresses.addresses.length-1];
         _addresses.addresses.length--;
    }

    function indexOf(Address storage _addresses, address _account)
        internal
        view
        notEmpty(_account)
        returns (uint16, bool)
    {
        for (uint16 ii = 0; ii < _addresses.addresses.length; ii++) {
            if (_addresses.addresses[ii] == _account) {
                return (ii, true);
            }
        }
        return (0, false);
    }

    function contains(Address storage _addresses, address _account)
        internal
        view
        notEmpty(_account)
        returns (bool)
    {
        (, bool isIn) = indexOf(_addresses, _account);
        return isIn;
    }

    function getLength(Address storage _addresses)
        internal
        view
        returns (uint)
    {
        return _addresses.addresses.length;
    }
}

