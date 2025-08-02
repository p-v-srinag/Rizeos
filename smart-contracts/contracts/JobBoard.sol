// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract JobBoard {
    address public owner;
    uint256 public platformFee;

    struct Job {
        uint256 jobId;
        address poster;
        string jobDataHash; // A hash of the off-chain job details
        uint256 timestamp;
    }

    uint256 private nextJobId;
    mapping(uint256 => Job) public jobs;

    event JobPosted(uint256 indexed jobId, address indexed poster, string jobDataHash);
    event FeeWithdrawn(address indexed owner, uint256 amount);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    constructor(uint256 _initialFee) {
        owner = msg.sender;
        platformFee = _initialFee;
    }

    function postJob(string calldata _jobDataHash) public payable {
        require(msg.value >= platformFee, "JobBoard: Insufficient platform fee paid.");
        
        jobs[nextJobId] = Job({
            jobId: nextJobId,
            poster: msg.sender,
            jobDataHash: _jobDataHash,
            timestamp: block.timestamp
        });

        emit JobPosted(nextJobId, msg.sender, _jobDataHash);
        
        nextJobId++;
    }

    function withdrawFees() public {
        require(msg.sender == owner, "JobBoard: Only the owner can withdraw fees.");
        
        uint256 balance = address(this).balance;
        require(balance > 0, "JobBoard: No fees to withdraw.");
        
        payable(owner).transfer(balance);
        emit FeeWithdrawn(owner, balance);
    }

    function setPlatformFee(uint256 _newFee) public {
        require(msg.sender == owner, "JobBoard: Only the owner can set the fee.");
        
        uint256 oldFee = platformFee;
        platformFee = _newFee;
        emit PlatformFeeUpdated(oldFee, _newFee);
    }
}