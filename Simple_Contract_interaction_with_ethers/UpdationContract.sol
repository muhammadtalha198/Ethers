//SPDX_License-Identifier: MIT
pragma solidity ^0.8.9;

contract StoreNumberTest{

    uint256 public number = 1;

    function updateNumber(uint256 _number) external {
        number = _number;
    }

} 

// Video Link :https://www.youtube.com/watch?v=_gdfX2mPgRc to understand better.
