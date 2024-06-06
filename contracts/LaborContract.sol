// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract LaborContract {
    struct Contract {
        address employer;
        address employee;
        uint256 amount;
        bool completed;
    }

    Contract[] public contracts;
    mapping(address => uint256) public balances;

    event ContractCreated(uint256 indexed contractId, address indexed employer, address indexed employee, uint256 amount);
    event ContractCompleted(uint256 indexed contractId);

    function createContract(address _employee) public payable {
        require(msg.value > 0, "Must send some ether");

        Contract memory newContract = Contract({
            employer: msg.sender,
            employee: _employee,
            amount: msg.value,
            completed: false
        });

        contracts.push(newContract);
        uint256 contractId = contracts.length - 1;

        emit ContractCreated(contractId, msg.sender, _employee, msg.value);
    }

    function completeContract(uint256 _contractId) public {
        Contract storage c = contracts[_contractId];
        require(msg.sender == c.employer, "Only employer can complete the contract");
        require(!c.completed, "Contract already completed");

        c.completed = true;
        balances[c.employee] += c.amount;

        emit ContractCompleted(_contractId);
    }

    function withdraw() public {
        uint256 payment = balances[msg.sender];
        require(payment > 0, "No funds to withdraw");

        balances[msg.sender] = 0;
        payable(msg.sender).transfer(payment);
    }
}
