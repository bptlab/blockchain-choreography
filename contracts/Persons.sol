pragma solidity ^0.4.24;

import "./Arrays.sol";

library Persons {

    using Arrays for Arrays.Address;

    struct Information {
        string username;
        string emailAddress;
    }

    struct Person {
        mapping (address => Information) personalInformation;
        Arrays.Address persons;
    }

    function add(Person storage _person, address _account, string _username, string _email)
        internal
        returns (bool)
    {
        if (_person.persons.pushUnique(_account))
        {
            _person.personalInformation[_account] = Information(_username, _email);
            return true;
        }
        return false;
    }

    function remove(Person storage _person, address _account)
        internal
    {
        _person.persons.remove(_account);
    }

    function isRegistered(Person storage _person, address _account)
        internal
        view
        returns (bool)
    {
        return _person.persons.contains(_account);
    }

    function getInformation(Person storage _person, address _account)
        internal
        view
        returns (string, string)
    {
        return (getUsername(_person, _account), getEmailAddress(_person, _account));
    }

    function getUsername(Person storage _person, address _account)
        internal
        view
        returns (string)
    {
        return _person.personalInformation[_account].username;
    }

    function getEmailAddress(Person storage _person, address _account)
        internal
        view
        returns (string)
    {
        return _person.personalInformation[_account].emailAddress;
    }

    function reset(Person storage _person)
        internal
    {
        _person.persons.removeAll();
    }

    function getNumberOfPersons(Person storage _person)
        internal
        view
    {
        _person.persons.getLength();
    }

}
