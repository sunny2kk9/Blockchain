const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Storage", function () {
  let Storage;
  let storage;
  let owner;
  let addr1;

  beforeEach(async function () {
    // Get signers
    [owner, addr1] = await ethers.getSigners();

    // Deploy contract
    Storage = await ethers.getContractFactory("Storage");
    storage = await Storage.deploy();
    await storage.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy with initial value of 0", async function () {
      const value = await storage.getValue();
      expect(value).to.equal(0);
    });
  });

  describe("Setter and Getter", function () {
    it("Should set and get value correctly", async function () {
      const testValue = 42;
      
      // Set value
      await storage.setValue(testValue);
      
      // Get value
      const retrievedValue = await storage.getValue();
      expect(retrievedValue).to.equal(testValue);
    });

    it("Should emit ValueChanged event when setting value", async function () {
      const oldValue = 0;
      const newValue = 100;
      
      await expect(storage.setValue(newValue))
        .to.emit(storage, "ValueChanged")
        .withArgs(oldValue, newValue);
    });

    it("Should allow multiple value changes", async function () {
      await storage.setValue(10);
      expect(await storage.getValue()).to.equal(10);

      await storage.setValue(20);
      expect(await storage.getValue()).to.equal(20);

      await storage.setValue(30);
      expect(await storage.getValue()).to.equal(30);
    });

    it("Should allow setting value to 0", async function () {
      await storage.setValue(100);
      await storage.setValue(0);
      expect(await storage.getValue()).to.equal(0);
    });

    it("Should allow any account to set value", async function () {
      const testValue = 999;
      
      // Set value from a different account
      await storage.connect(addr1).setValue(testValue);
      
      // Verify value was set
      expect(await storage.getValue()).to.equal(testValue);
    });
  });
});



