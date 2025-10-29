// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CertificateManager
 * @dev VAULT Protocol Certificate Management Smart Contract
 * @notice Manages certificate issuance, verification, modification, and deletion
 */
contract CertificateManager {
    
    // Struct to store certificate information (optimized for gas)
    struct Certificate {
        string fid;           // File ID - persistent logical identifier
        string cid;           // Content ID - IPFS hash for current version
        string email;        // Certificate holder email
        uint256 issueDate;   // Date of issue (timestamp)
        uint256 lastModified; // Last modification date
        address issuer;      // Address of the issuer
        bool isActive;       // Whether certificate is active
        // Removed versionHistory to save gas - versions tracked via events
    }
    
    // Mapping from FID to Certificate
    mapping(string => Certificate) public certificates;
    
    // Mapping from email to array of FIDs
    mapping(string => string[]) public certificatesByEmail;
    
    // Array to store all FIDs for enumeration
    string[] public allFIDs;
    
    // Events
    event CertificateIssued(
        string indexed fid,
        string cid,
        string email,
        uint256 issueDate,
        address indexed issuer
    );
    
    event CertificateUpdated(
        string indexed fid,
        string newCid,
        uint256 modificationDate,
        address indexed modifierAddress
    );
    
    event CertificateVerified(
        string indexed fid,
        string email,
        bool isValid,
        address indexed verifier
    );
    
    event CertificateDeleted(
        string indexed fid,
        address indexed deleter
    );
    
    // Modifiers
    modifier onlyIssuer(string memory fid) {
        require(certificates[fid].issuer == msg.sender, "Only issuer can modify certificate");
        _;
    }
    
    modifier certificateExists(string memory fid) {
        require(bytes(certificates[fid].fid).length > 0, "Certificate does not exist");
        _;
    }
    
    modifier certificateActive(string memory fid) {
        require(certificates[fid].isActive, "Certificate is not active");
        _;
    }
    
    /**
     * @dev Issue a new certificate
     * @param fid File ID - persistent identifier
     * @param cid Content ID - IPFS hash
     * @param email Certificate holder email
     */
    function issueCertificate(
        string memory fid,
        string memory cid,
        string memory email
    ) external {
        require(bytes(fid).length > 0, "FID cannot be empty");
        require(bytes(cid).length > 0, "CID cannot be empty");
        require(bytes(email).length > 0, "Email cannot be empty");
        require(bytes(certificates[fid].fid).length == 0, "Certificate with this FID already exists");
        
        // Create new certificate
        Certificate storage cert = certificates[fid];
        cert.fid = fid;
        cert.cid = cid;
        cert.email = email;
        cert.issueDate = block.timestamp;
        cert.lastModified = block.timestamp;
        cert.issuer = msg.sender;
        cert.isActive = true;
        // Version history removed to save gas
        
        // Add to email mapping
        certificatesByEmail[email].push(fid);
        
        // Add to all FIDs array
        allFIDs.push(fid);
        
        emit CertificateIssued(fid, cid, email, block.timestamp, msg.sender);
    }
    
    /**
     * @dev Update an existing certificate
     * @param fid File ID
     * @param newCid New Content ID - IPFS hash
     */
    function updateCertificate(
        string memory fid,
        string memory newCid
    ) external certificateExists(fid) onlyIssuer(fid) certificateActive(fid) {
        require(bytes(newCid).length > 0, "New CID cannot be empty");
        
        Certificate storage cert = certificates[fid];
        cert.cid = newCid;
        cert.lastModified = block.timestamp;
        // Version history removed to save gas
        
        emit CertificateUpdated(fid, newCid, block.timestamp, msg.sender);
    }
    
    /**
     * @dev Verify a certificate
     * @param fid File ID
     * @param email Email to verify against
     * @return isValid Whether the certificate is valid
     */
    function verifyCertificate(
        string memory fid,
        string memory email
    ) external certificateExists(fid) certificateActive(fid) returns (bool isValid) {
        Certificate storage cert = certificates[fid];
        
        // Check if email matches
        isValid = keccak256(bytes(cert.email)) == keccak256(bytes(email));
        
        emit CertificateVerified(fid, email, isValid, msg.sender);
        
        return isValid;
    }
    
    /**
     * @dev Get certificate details
     * @param fid File ID
     * @return Certificate struct
     */
    function getCertificate(string memory fid) 
        external 
        view 
        certificateExists(fid) 
        returns (Certificate memory) {
        return certificates[fid];
    }
    
    /**
     * @dev Get certificates by email
     * @param email Email address
     * @return Array of FIDs
     */
    function getCertificatesByEmail(string memory email)
        external
        view
        returns (string[] memory) {
        return certificatesByEmail[email];
    }
    
    /**
     * @dev Delete a certificate (mark as inactive)
     * @param fid File ID
     */
    function deleteCertificate(string memory fid)
        external
        certificateExists(fid)
        onlyIssuer(fid) {
        
        certificates[fid].isActive = false;
        
        emit CertificateDeleted(fid, msg.sender);
    }
    
    /**
     * @dev Get total number of certificates
     * @return Number of certificates
     */
    function getTotalCertificates() external view returns (uint256) {
        return allFIDs.length;
    }
    
    /**
     * @dev Get all FIDs (for enumeration)
     * @return Array of all FIDs
     */
    function getAllFIDs() external view returns (string[] memory) {
        return allFIDs;
    }
    
    /**
     * @dev Check if certificate exists and is active
     * @param fid File ID
     * @return exists Whether certificate exists
     * @return active Whether certificate is active
     */
    function certificateStatus(string memory fid)
        external
        view
        returns (bool exists, bool active) {
        exists = bytes(certificates[fid].fid).length > 0;
        active = exists && certificates[fid].isActive;
    }
}
