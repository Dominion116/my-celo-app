import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MotivationTokModule = buildModule("MotivationTokModule", (m) => {
  const motivationTok = m.contract("MotivationTok", []);

  return { motivationTok };
});

export default MotivationTokModule;
