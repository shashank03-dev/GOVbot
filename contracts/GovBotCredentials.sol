// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GovBotCredentials
 * @dev W3C Verifiable Credentials registry for scholarship certificates
 * @notice Production contract for GOVbot scholarship credentials - deployed to Polygon Mumbai
 */
contract GovBotCredentials {
    struct Credential {
        string credentialId;
        string confirmationNumber;
        bytes32 credentialHash;  // SHA256 of credential JSON
        address issuer;
        uint256 issuedAt;
        bool revoked;
        string metadataURI;  // IPFS hash
    }
    
    // credentialId => Credential
    mapping(string => Credential) public credentials;
    
    // confirmationNumber => credentialId
    mapping(string => string) public confirmationToCredential;
    
    // credentialHash => exists (for uniqueness check)
    mapping(bytes32 => bool) public credentialHashes;
    
    // Issuer management
    address public owner;
    mapping(address => bool) public authorizedIssuers;
    
    // Events
    event CredentialIssued(
        string indexed credentialId,
        string indexed confirmationNumber,
        bytes32 credentialHash,
        address indexed issuer,
        uint256 issuedAt,
        string metadataURI
    );
    
    event CredentialRevoked(
        string indexed credentialId,
        uint256 revokedAt,
        string reason
    );
    
    event IssuerAdded(address indexed issuer);
    event IssuerRemoved(address indexed issuer);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner || authorizedIssuers[msg.sender],
            "Not authorized to issue credentials"
        );
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;  // Owner is also an issuer
    }
    
    // Issuer management
    function addIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAdded(issuer);
    }
    
    function removeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRemoved(issuer);
    }
    
    // Credential issuance
    function issueCredential(
        string calldata credentialId,
        string calldata confirmationNumber,
        bytes32 credentialHash,
        string calldata metadataURI
    ) external onlyAuthorized returns (bool) {
        // Check if credential already exists
        require(bytes(credentials[credentialId].credentialId).length == 0, "Credential already exists");
        
        // Check if confirmation number already has a credential
        require(
            bytes(confirmationToCredential[confirmationNumber]).length == 0,
            "Confirmation number already has credential"
        );
        
        // Check if hash is unique
        require(!credentialHashes[credentialHash], "Credential hash already used");
        
        // Store credential
        credentials[credentialId] = Credential({
            credentialId: credentialId,
            confirmationNumber: confirmationNumber,
            credentialHash: credentialHash,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            revoked: false,
            metadataURI: metadataURI
        });
        
        // Map confirmation to credential
        confirmationToCredential[confirmationNumber] = credentialId;
        
        // Mark hash as used
        credentialHashes[credentialHash] = true;
        
        emit CredentialIssued(
            credentialId,
            confirmationNumber,
            credentialHash,
            msg.sender,
            block.timestamp,
            metadataURI
        );
        
        return true;
    }
    
    // Credential revocation
    function revokeCredential(
        string calldata credentialId,
        string calldata reason
    ) external onlyAuthorized {
        require(bytes(credentials[credentialId].credentialId).length > 0, "Credential does not exist");
        require(!credentials[credentialId].revoked, "Already revoked");
        
        credentials[credentialId].revoked = true;
        
        emit CredentialRevoked(credentialId, block.timestamp, reason);
    }
    
    // View functions
    function getCredential(string calldata credentialId) external view returns (Credential memory) {
        require(bytes(credentials[credentialId].credentialId).length > 0, "Credential not found");
        return credentials[credentialId];
    }
    
    function getCredentialByConfirmation(string calldata confirmationNumber) external view returns (Credential memory) {
        string memory credentialId = confirmationToCredential[confirmationNumber];
        require(bytes(credentialId).length > 0, "No credential for this confirmation");
        return credentials[credentialId];
    }
    
    function verifyCredential(
        string calldata credentialId,
        bytes32 credentialHash
    ) external view returns (bool valid, bool revoked, uint256 issuedAt) {
        Credential memory cred = credentials[credentialId];
        
        if (bytes(cred.credentialId).length == 0) {
            return (false, false, 0);
        }
        
        // Verify hash matches
        bool hashValid = (cred.credentialHash == credentialHash);
        
        return (hashValid, cred.revoked, cred.issuedAt);
    }
    
    function isIssuerAuthorized(address issuer) external view returns (bool) {
        return authorizedIssuers[issuer] || issuer == owner;
    }
    
    // Batch functions for analytics
    function getTotalCredentials() external view returns (uint256) {
        // Note: This is a simplified count. In production, you'd maintain a counter.
        return 0;  // Placeholder
    }
}
