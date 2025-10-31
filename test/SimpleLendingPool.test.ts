// File: test/SimpleLendingPool.test.ts

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Contract, ContractFactory } from "ethers";

// We use `BigInt` for token amounts in TypeScript/Ethers.js
const ONE_HUNDRED_TOKENS = ethers.parseEther("100"); // 100 * 10^18
const SEVENTY_FIVE_TOKENS = ethers.parseEther("75");
const FIFTY_TOKENS = ethers.parseEther("50");

describe("SimpleLendingPool", function () {
  // Declare variables for contracts and signers
  let SimpleLendingPool: ContractFactory;
  let MockERC20: ContractFactory;
  let pool: Contract;
  let collateralToken: Contract;
  let borrowToken: Contract;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;

  beforeEach(async function () {
    // Get test accounts
    [owner, user1] = await ethers.getSigners();

    // 1. Get contract factories
    MockERC20 = await ethers.getContractFactory("MockERC20");
    SimpleLendingPool = await ethers.getContractFactory("SimpleLendingPool");

    // 2. Deploy mock tokens
    collateralToken = await MockERC20.deploy("Collateral Token", "COL");
    borrowToken = await MockERC20.deploy("Borrow Token", "BOR");

    // 3. Deploy the SimpleLendingPool
    pool = await SimpleLendingPool.deploy(
      await collateralToken.getAddress(),
      await borrowToken.getAddress()
    );

    // 4. Prepare token balances
    await collateralToken.mint(user1.address, ethers.parseEther("1000"));
    await borrowToken.mint(await pool.getAddress(), ethers.parseEther("1000"));

    // 5. User1 must "approve" the pool
    await collateralToken
      .connect(user1)
      .approve(await pool.getAddress(), ethers.MaxUint256);
  });

  it("should allow a user to deposit collateral", async function () {
    await pool.connect(user1).depositCollateral(ONE_HUNDRED_TOKENS);

    expect(await pool.collateralDeposits(user1.address)).to.equal(
      ONE_HUNDRED_TOKENS
    );
    expect(await collateralToken.balanceOf(await pool.getAddress())).to.equal(
      ONE_HUNDRED_TOKENS
    );
  });

  it("should allow a user to borrow up to the collateral factor (75%)", async function () {
    await pool.connect(user1).depositCollateral(ONE_HUNDRED_TOKENS);
    await pool.connect(user1).borrow(SEVENTY_FIVE_TOKENS);

    expect(await pool.borrowBalances(user1.address)).to.equal(
      SEVENTY_FIVE_TOKENS
    );
    expect(await borrowToken.balanceOf(user1.address)).to.equal(
      SEVENTY_FIVE_TOKENS
    );
  });

  it("should FAIL to borrow if over the collateral limit", async function () {
    await pool.connect(user1).depositCollateral(ONE_HUNDRED_TOKENS);
    const SEVENTY_SIX_TOKENS = ethers.parseEther("76");

    await expect(
      pool.connect(user1).borrow(SEVENTY_SIX_TOKENS)
    ).to.be.revertedWith("Borrow amount exceeds collateral limit");
  });

  it("should allow a user to repay their debt", async function () {
    await pool.connect(user1).depositCollateral(ONE_HUNDRED_TOKENS);
    await pool.connect(user1).borrow(SEVENTY_FIVE_TOKENS);

    // User must approve the pool to take back BOR tokens
    await borrowToken
      .connect(user1)
      .approve(await pool.getAddress(), ethers.MaxUint256);

    await pool.connect(user1).repay(FIFTY_TOKENS);

    const TWENTY_FIVE_TOKENS = ethers.parseEther("25");
    expect(await pool.borrowBalances(user1.address)).to.equal(
      TWENTY_FIVE_TOKENS
    );
    expect(await borrowToken.balanceOf(user1.address)).to.equal(
      TWENTY_FIVE_TOKENS
    );
  });

  it("should FAIL to withdraw collateral if it makes them under-collateralized", async function () {
    await pool.connect(user1).depositCollateral(ONE_HUNDRED_TOKENS);
    await pool.connect(user1).borrow(FIFTY_TOKENS);

    const SIXTY_TOKENS = ethers.parseEther("60");
    await expect(
      pool.connect(user1).withdrawCollateral(SIXTY_TOKENS)
    ).to.be.revertedWith("Withdrawal would cause under-collateralization");
  });

  it("should allow a user to withdraw collateral if they are still solvent", async function () {
    await pool.connect(user1).depositCollateral(ONE_HUNDRED_TOKENS);
    await pool.connect(user1).borrow(FIFTY_TOKENS);

    const TWENTY_TOKENS = ethers.parseEther("20");
    await pool.connect(user1).withdrawCollateral(TWENTY_TOKENS);

    const EIGHTY_TOKENS = ethers.parseEther("80");
    expect(await pool.collateralDeposits(user1.address)).to.equal(
      EIGHTY_TOKENS
    );
  });
});