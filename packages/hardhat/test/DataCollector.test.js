const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DataCollector Contract", function () {
  let DataCollector, collector;
  let owner, user1, user2;

  beforeEach(async function () {
    DataCollector = await ethers.getContractFactory("DataCollector");
    [owner, user1, user2] = await ethers.getSigners();
    collector = await DataCollector.deploy();
    await collector.waitForDeployment(); // Ethers 6 method
  });

  it("Owner can start and end data collection", async function () {
    await collector.connect(owner).startCollection();
    expect(await collector.collecting()).to.equal(true);

    await collector.connect(owner).endCollection();
    expect(await collector.collecting()).to.equal(false);
  });

  it("Non-owner cannot start or end collection", async function () {
    await expect(collector.connect(user1).startCollection()).to.be.revertedWith("Only owner can call");
    await collector.connect(owner).startCollection();
    await expect(collector.connect(user1).endCollection()).to.be.revertedWith("Only owner can call");
    await collector.connect(owner).endCollection();
  });

  it("Participants can submit valid data during collection", async function () {
    await collector.connect(owner).startCollection();

    await collector.connect(user1).submitData(100, 5);
    await collector.connect(user2).submitData(200, 10);

    const [prices, quantities] = await collector.getCollectedData();
    expect(prices).to.deep.equal([100, 200]);
    expect(quantities).to.deep.equal([5, 10]);

    await collector.connect(owner).endCollection();
  });

  it("submitData fails when values exceed 2**23", async function () {
    await collector.connect(owner).startCollection();

    // price 超过限制
    await expect(
      collector.connect(user1).submitData(2 ** 23, 1)
    ).to.be.revertedWith("price exceeds uint23");

    // quantity 超过限制
    await expect(
      collector.connect(user1).submitData(1, 2 ** 23)
    ).to.be.revertedWith("quantity exceeds uint23");

    await collector.connect(owner).endCollection();
  });

  it("Broadcast works only after collection ends and length must match", async function () {
    await collector.connect(owner).startCollection();

    await collector.connect(user1).submitData(10, 1);
    await collector.connect(user2).submitData(20, 2);

    // broadcast during collection should fail
    await expect(
      collector.connect(owner).broadcast([true, false])
    ).to.be.revertedWith("Cannot perform this action while collecting");

    await collector.connect(owner).endCollection();

    // broadcast with correct length
    await collector.connect(owner).broadcast([true, false]);
    const broadcasted = await collector.getBroadcastData();
    expect(broadcasted).to.deep.equal([true, false]);

    // broadcast with incorrect length should fail
    await expect(
      collector.connect(owner).broadcast([true])
    ).to.be.revertedWith("Broadcast length must match collected data");
  });

  it("Only owner can broadcast", async function () {
    await collector.connect(owner).startCollection();
    await collector.connect(user1).submitData(1, 1);
    await collector.connect(owner).endCollection();

    await expect(
      collector.connect(user1).broadcast([true])
    ).to.be.revertedWith("Only owner can call");
  });
});
