import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("MotivationTok", function () {
  async function deployFixture() {
    const [owner, user] = await hre.viem.getWalletClients();
    const motivationTok = await hre.viem.deployContract("MotivationTok", []);

    const publicClient = await hre.viem.getPublicClient();

    const asUser = await hre.viem.getContractAt("MotivationTok", motivationTok.address, {
      client: { wallet: user },
    });

    return { motivationTok, owner, user, asUser, publicClient };
  }

  it("toggles like and dislike correctly", async function () {
    const { asUser, user } = await loadFixture(deployFixture);

    await asUser.write.toggleLike([1n]);
    let counters = await asUser.read.getQuoteCounters([1n]);
    expect(counters[0]).to.equal(1n);
    expect(counters[1]).to.equal(0n);

    await asUser.write.toggleDislike([1n]);
    counters = await asUser.read.getQuoteCounters([1n]);
    expect(counters[0]).to.equal(0n);
    expect(counters[1]).to.equal(1n);

    const state = await asUser.read.getUserQuoteState([user.account.address, 1n]);
    expect(state[0]).to.equal(false);
    expect(state[1]).to.equal(true);
  });

  it("toggles save and maintains saved quote ids", async function () {
    const { asUser, user } = await loadFixture(deployFixture);

    await asUser.write.toggleSave([2n]);
    let savedCount = await asUser.read.getSavedQuoteCount([user.account.address]);
    expect(savedCount).to.equal(1n);

    let saved = await asUser.read.getSavedQuoteIds([user.account.address, 0n, 10n]);
    expect(saved.map((id) => Number(id))).to.deep.equal([2]);

    await asUser.write.toggleSave([2n]);
    savedCount = await asUser.read.getSavedQuoteCount([user.account.address]);
    expect(savedCount).to.equal(0n);
  });

  it("updates streak at most once per day", async function () {
    const { asUser, user } = await loadFixture(deployFixture);

    await asUser.write.recordVisit();
    await asUser.write.recordVisit();

    let streak = await asUser.read.getUserStreak([user.account.address]);
    expect(streak[0]).to.equal(1n);
    expect(streak[1]).to.equal(1n);

    await time.increase(24 * 60 * 60 + 1);

    await asUser.write.recordVisit();
    streak = await asUser.read.getUserStreak([user.account.address]);
    expect(streak[0]).to.equal(2n);
    expect(streak[1]).to.equal(2n);
  });

  it("emits indexable interaction events", async function () {
    const { asUser, publicClient, motivationTok } = await loadFixture(deployFixture);

    const tx = await asUser.write.toggleLike([4n]);
    await publicClient.waitForTransactionReceipt({ hash: tx });

    const events = await motivationTok.getEvents.QuoteReactionUpdated();
    expect(events.length).to.equal(1);
    expect(events[0].args.quoteId).to.equal(4n);
    expect(events[0].args.newReaction).to.equal(1);
  });
});
