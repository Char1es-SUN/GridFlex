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

  it("Participants can submit data during collection", async function () {
    await collector.connect(owner).startCollection();

    // Users submit numeric data
    await collector.connect(user1).submitData(100, 5);
    await collector.connect(user2).submitData(200, 10);

    // Check collected data
    const [prices, quantities] = await collector.getCollectedData();
    expect(prices).to.deep.equal([100, 200]);
    expect(quantities).to.deep.equal([5, 10]);

    await collector.connect(owner).endCollection();
  });

  it("Broadcast works only after collection ends and lengths must match", async function () {
    await collector.connect(owner).startCollection();

    await collector.connect(user1).submitData(111, 1);
    await collector.connect(user2).submitData(222, 2);

    // Cannot broadcast during collection
    await expect(
      collector.connect(owner).broadcast(["R1", "R2"])
    ).to.be.revertedWith("Cannot perform this action while collecting");

    await collector.connect(owner).endCollection();

    // Broadcasting with correct length
    await collector.connect(owner).broadcast(["R1", "R2"]);
    const broadcasted = await collector.getBroadcastData();
    expect(broadcasted).to.deep.equal(["R1", "R2"]);

    // Broadcasting with incorrect length - should fail
    await expect(
      collector.connect(owner).broadcast(["OnlyOne"])
    ).to.be.revertedWith("Broadcast length must match collected data");
  });

  it("Only owner can start, end collection and broadcast", async function () {
    // Non-owner tries to start collection
    await expect(
      collector.connect(user1).startCollection()
    ).to.be.revertedWith("Only owner can call");

    await collector.connect(owner).startCollection();

    // Non-owner tries to end collection
    await expect(
      collector.connect(user1).endCollection()
    ).to.be.revertedWith("Only owner can call");

    await collector.connect(owner).endCollection();

    // Non-owner tries to broadcast
    await expect(
      collector.connect(user1).broadcast([])
    ).to.be.revertedWith("Only owner can call");
  });
});
