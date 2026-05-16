const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AsyncLending", function () {
  let contract, owner, verifier, user1, user2;

  beforeEach(async () => {
    [owner, verifier, user1, user2] = await ethers.getSigners();
    const AsyncLending = await ethers.getContractFactory("AsyncLending");
    contract = await AsyncLending.deploy();
    await contract.waitForDeployment();
    await contract.depositFunds({ value: ethers.parseEther("5") });
  });

  it("Should deploy and fund correctly", async () => {
    expect(await contract.getContractBalance()).to.equal(ethers.parseEther("5"));
    expect(await contract.owner()).to.equal(owner.address);
  });

  it("Should create loan request", async () => {
    const tx = await contract.connect(user1).requestLoan(ethers.parseEther("0.1"));
    const receipt = await tx.wait();
    expect(await contract.workflowCount()).to.equal(1);
    const wf = await contract.getWorkflow(1);
    expect(wf.user).to.equal(user1.address);
    expect(wf.state).to.equal(0); // PENDING
  });

  it("Should transition workflow states correctly", async () => {
    await contract.connect(user1).requestLoan(ethers.parseEther("0.1"));
    await contract.startVerification(1);
    let wf = await contract.getWorkflow(1);
    expect(wf.state).to.equal(1); // VERIFYING

    await contract.approveWorkflow(1);
    wf = await contract.getWorkflow(1);
    expect(wf.state).to.equal(4); // COMPLETED
  });

  it("Should disburse funds on approval", async () => {
    const loanAmount = ethers.parseEther("0.1");
    await contract.connect(user1).requestLoan(loanAmount);
    const balanceBefore = await ethers.provider.getBalance(user1.address);
    await contract.approveWorkflow(1);
    const balanceAfter = await ethers.provider.getBalance(user1.address);
    expect(balanceAfter).to.be.gt(balanceBefore);
  });

  it("Should reject workflow", async () => {
    await contract.connect(user1).requestLoan(ethers.parseEther("0.5"));
    await contract.rejectWorkflow(1, "Low credit score");
    const wf = await contract.getWorkflow(1);
    expect(wf.state).to.equal(3); // REJECTED
    expect(wf.rejectReason).to.equal("Low credit score");
  });

  it("Should allow user to cancel pending workflow", async () => {
    await contract.connect(user1).requestLoan(ethers.parseEther("0.1"));
    await contract.connect(user1).cancelWorkflow(1);
    const wf = await contract.getWorkflow(1);
    expect(wf.state).to.equal(5); // CANCELLED
  });

  it("Should handle payment verification", async () => {
    await contract.connect(user1).requestPaymentVerification(ethers.parseEther("0.2"));
    await contract.approveWorkflow(1);
    const wf = await contract.getWorkflow(1);
    expect(wf.state).to.equal(4); // COMPLETED
    expect(wf.isLoan).to.equal(false);
  });
});
