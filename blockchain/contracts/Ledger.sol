// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Ini adalah program kita yang akan hidup di blockchain
contract Ledger {
    // Variabel untuk menyimpan hash dari blok terakhir
    string public lastHash;
    uint256 public blockCount;

    // Event untuk memberi notifikasi saat ada blok baru
    event BlockAdded(uint256 indexed blockNumber, string dataHash, string previousHash, uint256 timestamp);

    // Fungsi ini akan dipanggil pertama kali saat deployment
    constructor() {
        // Inisialisasi genesis block (blok pertama)
        lastHash = "0000000000000000000000000000000000000000000000000000000000000000";
    }

    // FUNGSI Simpan dan emit previousHash
    function addRecordHash(string memory _dataHash) public {
        string memory previousHash = lastHash; // Simpan hash sebelumnya
        lastHash = _dataHash; // Perbarui dengan hash yang baru
        blockCount++;
        emit BlockAdded(blockCount, _dataHash, previousHash, block.timestamp); // Emit semua data
    }
}