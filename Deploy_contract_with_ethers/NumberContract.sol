// SPDX-License-Identifier: NOLICENSED
pragma solidity  0.8.0;

contract Number{
    uint public number = 1;

    event myEvent(address indexed senderAddress, uint256 indexed value);
    
    function emityEvent() external {
        emit myEvent(msg.sender, 99);
    }

    function deposit () external payable {

    }

    function getBalance() external view returns(uint256){
        return address(this).balance;
    }

    function incrementNumber () public {
        number += 1;
    }

}
