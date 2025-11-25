const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("LockModule", (m) => {
  const unlockTime = Math.floor(Date.now() / 1000) + 60; // 1 minute from now
const getSet = m.contract("GetSet");
return { getSet };

});
