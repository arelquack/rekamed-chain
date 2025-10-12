import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LedgerModule = buildModule("LedgerModule", (m) => {
  // Perintah ini memberitahu ignition untuk men-deploy kontrak bernama "Ledger"
  // yang ada di folder contracts/
  const ledger = m.contract("Ledger");

  return { ledger };
});

export default LedgerModule;