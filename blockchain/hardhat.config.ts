import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    // Konfigurasi ini khusus untuk jaringan development lokal Hardhat
    hardhat: {
      chainId: 1337, // Chain ID standar untuk jaringan lokal
      // Menetapkan saldo awal untuk semua akun default
      accounts: {
        count: 20, // Jumlah akun yang akan dibuat
        accountsBalance: "10000000000000000000000", // 10,000 ETH dalam Wei
      },
    },
  },
};

export default config;