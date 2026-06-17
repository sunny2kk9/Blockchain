const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GetterSetter", function () {
  it("should set initial value and allow updates", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const GetterSetter = await ethers.getContractFactory("GetterSetter");
    const contract = await GetterSetter.deploy("initial");

    // ✅ wait for deployment (ethers v6)
    await contract.waitForDeployment();

    expect(await contract.getValue()).to.equal("initial");

    await contract.setValue("fromOwner");
    expect(await contract.getValue()).to.equal("fromOwner");

    // test event
    await expect(contract.connect(addr1).setValue("byOther"))
      .to.emit(contract, "ValueUpdated")
      .withArgs(addr1.address, "fromOwner", "byOther");

    expect(await contract.getValue()).to.equal("byOther");
  });

  it("owner-only setter should revert for non-owner", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const GetterSetter = await ethers.getContractFactory("GetterSetter");
    const contract = await GetterSetter.deploy("start");

    // ✅ wait for deployment
    await contract.waitForDeployment();

    await expect(contract.connect(addr1).setValueOwnerOnly("x"))
      .to.be.revertedWith("Only owner");

    await contract.connect(owner).setValueOwnerOnly("owner set");
    expect(await contract.getValue()).to.equal("owner set");
  });
});
