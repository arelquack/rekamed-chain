// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Ini adalah program kita yang akan hidup di blockchain
contract Ledger {
    // Variabel untuk menyimpan hash dari blok terakhir
    string public lastHash;
    uint256 public blockCount;

    // Event untuk memberi notifikasi saat ada blok baru
    event BlockAdded(uint256 indexed blockNumber, string dataHash);

    // Fungsi untuk menambahkan catatan hash baru
    function addRecordHash(string memory _dataHash) public {
        lastHash = _dataHash;
        blockCount++;
        emit BlockAdded(blockCount, _dataHash);
    }
}