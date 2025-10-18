const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DataCollector Contract", function () {
  let DataCollector, collector;
  let owner, user1, user2;

  // Runs before each test, deploy a fresh contract
  beforeEach(async function () {
    DataCollector = await ethers.getContractFactory("DataCollector");
    [owner, user1, user2] = await ethers.getSigners();
    collector = await DataCollector.deploy();
    await collector.waitForDeployment(); // Ethers 6 method
  });

  it("Owner can start and end data collection", async function () {
    // Start data collection
    await collector.connect(owner).startCollection();
    
    // Contract should be collecting
    expect(await collector.collecting()).to.equal(true);

    // End data collection
    await collector.connect(owner).endCollection();
    expect(await collector.collecting()).to.equal(false);
  });

  it("Participants can submit data during collection", async function () {
    await collector.connect(owner).startCollection();

    // Users submit data
    await collector.connect(user1).submitData("User1 data");
    await collector.connect(user2).submitData("User2 data");

    // Check collected data
    const collected = await collector.getCollectedData();
    expect(collected).to.deep.equal(["User1 data", "User2 data"]);

    await collector.connect(owner).endCollection();
  });

  it("Broadcast works only after collection ends and lengths must match", async function () {
    await collector.connect(owner).startCollection();

    // Submit data
    await collector.connect(user1).submitData("U1");
    await collector.connect(user2).submitData("U2");

    // Cannot broadcast during collection
    await expect(
      collector.connect(owner).broadcast(["B1", "B2"])
    ).to.be.revertedWith("Cannot perform this action while collecting");

    await collector.connect(owner).endCollection();

    // Broadcasting with correct length
    await collector.connect(owner).broadcast(["B1", "B2"]);
    const broadcasted = await collector.getBroadcastData();
    expect(broadcasted).to.deep.equal(["B1", "B2"]);

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
