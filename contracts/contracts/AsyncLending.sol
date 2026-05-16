// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AsyncLending {
    enum WorkflowState {
        PENDING,
        VERIFYING,
        APPROVED,
        REJECTED,
        COMPLETED,
        CANCELLED
    }

    struct Workflow {
        uint256 id;
        address user;
        uint256 amount;
        WorkflowState state;
        uint256 createdAt;
        uint256 updatedAt;
        string rejectReason;
        bool isLoan;
    }

    address public owner;
    address public verifier;
    uint256 public workflowCount;
    uint256 public totalLoanPool;

    mapping(uint256 => Workflow) public workflows;
    mapping(address => uint256[]) public userWorkflows;
    mapping(address => uint256) public creditScores;
    mapping(address => bool) public kycVerified;

    event WorkflowCreated(uint256 indexed id, address indexed user, uint256 amount, bool isLoan);
    event WorkflowStateChanged(uint256 indexed id, WorkflowState oldState, WorkflowState newState);
    event LoanApproved(uint256 indexed id, address indexed user, uint256 amount);
    event LoanRejected(uint256 indexed id, address indexed user, string reason);
    event PaymentSettled(uint256 indexed id, address indexed user, uint256 amount);
    event FundsDeposited(address indexed depositor, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyVerifier() {
        require(msg.sender == verifier || msg.sender == owner, "Not verifier");
        _;
    }

    modifier workflowExists(uint256 id) {
        require(id > 0 && id <= workflowCount, "Workflow not found");
        _;
    }

    constructor() {
        owner = msg.sender;
        verifier = msg.sender;
    }

    function setVerifier(address _verifier) external onlyOwner {
        verifier = _verifier;
    }

    function depositFunds() external payable onlyOwner {
        totalLoanPool += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }

    function setKYC(address user, bool status) external onlyVerifier {
        kycVerified[user] = status;
    }

    function setCreditScore(address user, uint256 score) external onlyVerifier {
        require(score <= 1000, "Score max 1000");
        creditScores[user] = score;
    }

    function requestLoan(uint256 amount) external returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= 10 ether, "Max loan 10 ETH");

        workflowCount++;
        uint256 id = workflowCount;

        workflows[id] = Workflow({
            id: id,
            user: msg.sender,
            amount: amount,
            state: WorkflowState.PENDING,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            rejectReason: "",
            isLoan: true
        });

        userWorkflows[msg.sender].push(id);

        emit WorkflowCreated(id, msg.sender, amount, true);
        return id;
    }

    function requestPaymentVerification(uint256 amount) external returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");

        workflowCount++;
        uint256 id = workflowCount;

        workflows[id] = Workflow({
            id: id,
            user: msg.sender,
            amount: amount,
            state: WorkflowState.PENDING,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            rejectReason: "",
            isLoan: false
        });

        userWorkflows[msg.sender].push(id);

        emit WorkflowCreated(id, msg.sender, amount, false);
        return id;
    }

    function startVerification(uint256 id) external onlyVerifier workflowExists(id) {
        Workflow storage wf = workflows[id];
        require(wf.state == WorkflowState.PENDING, "Not in PENDING state");

        WorkflowState old = wf.state;
        wf.state = WorkflowState.VERIFYING;
        wf.updatedAt = block.timestamp;

        emit WorkflowStateChanged(id, old, WorkflowState.VERIFYING);
    }

    function approveWorkflow(uint256 id) external onlyVerifier workflowExists(id) {
        Workflow storage wf = workflows[id];
        require(
            wf.state == WorkflowState.VERIFYING || wf.state == WorkflowState.PENDING,
            "Not in verifiable state"
        );

        WorkflowState old = wf.state;
        wf.state = WorkflowState.APPROVED;
        wf.updatedAt = block.timestamp;

        emit WorkflowStateChanged(id, old, WorkflowState.APPROVED);

        if (wf.isLoan) {
            _disburseLoan(id);
        } else {
            _settlePayment(id);
        }
    }

    function rejectWorkflow(uint256 id, string calldata reason) external onlyVerifier workflowExists(id) {
        Workflow storage wf = workflows[id];
        require(
            wf.state == WorkflowState.VERIFYING || wf.state == WorkflowState.PENDING,
            "Not in verifiable state"
        );

        WorkflowState old = wf.state;
        wf.state = WorkflowState.REJECTED;
        wf.rejectReason = reason;
        wf.updatedAt = block.timestamp;

        emit WorkflowStateChanged(id, old, WorkflowState.REJECTED);
        emit LoanRejected(id, wf.user, reason);
    }

    function _disburseLoan(uint256 id) internal {
        Workflow storage wf = workflows[id];
        require(address(this).balance >= wf.amount, "Insufficient pool funds");

        wf.state = WorkflowState.COMPLETED;
        wf.updatedAt = block.timestamp;

        (bool success, ) = payable(wf.user).call{value: wf.amount}("");
        require(success, "Transfer failed");

        emit LoanApproved(id, wf.user, wf.amount);
        emit WorkflowStateChanged(id, WorkflowState.APPROVED, WorkflowState.COMPLETED);
    }

    function _settlePayment(uint256 id) internal {
        Workflow storage wf = workflows[id];
        wf.state = WorkflowState.COMPLETED;
        wf.updatedAt = block.timestamp;

        emit PaymentSettled(id, wf.user, wf.amount);
        emit WorkflowStateChanged(id, WorkflowState.APPROVED, WorkflowState.COMPLETED);
    }

    function cancelWorkflow(uint256 id) external workflowExists(id) {
        Workflow storage wf = workflows[id];
        require(wf.user == msg.sender || msg.sender == owner, "Not authorized");
        require(
            wf.state == WorkflowState.PENDING,
            "Can only cancel PENDING workflows"
        );

        WorkflowState old = wf.state;
        wf.state = WorkflowState.CANCELLED;
        wf.updatedAt = block.timestamp;

        emit WorkflowStateChanged(id, old, WorkflowState.CANCELLED);
    }

    function getWorkflow(uint256 id) external view workflowExists(id) returns (Workflow memory) {
        return workflows[id];
    }

    function getUserWorkflows(address user) external view returns (uint256[] memory) {
        return userWorkflows[user];
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getAllWorkflows() external view returns (Workflow[] memory) {
        Workflow[] memory all = new Workflow[](workflowCount);
        for (uint256 i = 1; i <= workflowCount; i++) {
            all[i - 1] = workflows[i];
        }
        return all;
    }

    function withdrawFunds(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Withdraw failed");
    }

    receive() external payable {
        totalLoanPool += msg.value;
    }
}
