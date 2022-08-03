// SPDX-License-Identifier: MIT
// Creator: https://cojodi.com
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BasicERC721 is ERC721 {
  using Counters for Counters.Counter;

  Counters.Counter private _totalSupply;

  constructor() ERC721("TEST", "TEST") {}

  function mintOwner(address receiver_, uint256 amount_) external {
    for (uint256 i = 0; i < amount_; ++i) {
      uint256 newId = Counters.current(_totalSupply) + 1;
      ERC721._safeMint(receiver_, newId);
      Counters.increment(_totalSupply);
    }
  }
}
