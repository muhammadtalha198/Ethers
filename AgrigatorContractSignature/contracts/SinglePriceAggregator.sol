// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SinglePriceAggregator (Test-only)
/// @notice Simple single-token update variant for testing. Supports both direct updater
///         and EIP-712 signed updates. Enforces a 20-second cooldown per token and
///         optional max deviation guard.
contract SinglePriceAggregator {
    struct PriceData {
        uint128 price;
        uint64 lastUpdated;
        uint8 decimals;
    }

    mapping(address => PriceData) private tokenToPriceData;

    address public owner;
    address public updater; // direct updater (EOA)
    address public signer;  // EIP-712 signer

    uint32 public constant MIN_UPDATE_INTERVAL = 20;
    uint16 public maxDeviationBps; // 0 disables

    // EIP-712
    bytes32 private immutable DOMAIN_SEPARATOR;
    bytes32 private constant EIP712_DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 private constant NAME_HASH = keccak256("SinglePriceAggregator");
    bytes32 private constant VERSION_HASH = keccak256("1");
    // PriceSingle(address token,uint128 price,uint8 decimals,uint64 validUntil,uint256 nonce)
    bytes32 private constant PRICE_SINGLE_TYPEHASH = keccak256("PriceSingle(address token,uint128 price,uint8 decimals,uint64 validUntil,uint256 nonce)");

    mapping(uint256 => bool) public usedNonces;

    // Events
    event PriceUpdated(address indexed token, uint128 price, uint64 timestamp, uint8 decimals);
    event OwnerChanged(address indexed newOwner);
    event UpdaterChanged(address indexed newUpdater);
    event SignerChanged(address indexed newSigner);
    event TokenConfigured(address indexed token, uint8 decimals);
    event MaxDeviationBpsChanged(uint16 bps);

    // Errors
    error NotOwner();
    error NotUpdater();
    error CooldownActive(address token, uint64 last, uint64 nowTs);
    error ExcessiveDeviation(address token, uint128 oldPrice, uint128 newPrice, uint16 maxDeviationBps);
    error SignatureExpired(uint64 validUntil, uint64 nowTs);
    error InvalidSignature();
    error NonceUsed(uint256 nonce);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyUpdater() {
        if (msg.sender != updater) revert NotUpdater();
        _;
    }

    constructor(address initialUpdater) {
        owner = msg.sender;
        updater = initialUpdater;
        signer = msg.sender;

        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                NAME_HASH,
                VERSION_HASH,
                chainId,
                address(this)
            )
        );

        emit OwnerChanged(msg.sender);
        emit UpdaterChanged(initialUpdater);
        emit SignerChanged(signer);
    }

    // Admin
    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
        emit OwnerChanged(newOwner);
    }

    function setUpdater(address newUpdater) external onlyOwner {
        updater = newUpdater;
        emit UpdaterChanged(newUpdater);
    }

    function setSigner(address newSigner) external onlyOwner {
        signer = newSigner;
        emit SignerChanged(newSigner);
    }

    function setMaxDeviationBps(uint16 newMaxDeviationBps) external onlyOwner {
        maxDeviationBps = newMaxDeviationBps;
        emit MaxDeviationBpsChanged(newMaxDeviationBps);
    }

    function setTokenDecimals(address token, uint8 decimals) external onlyOwner {
        tokenToPriceData[token].decimals = decimals;
        emit TokenConfigured(token, decimals);
    }

    // Views
    function getPrice(address token) external view returns (uint128 price, uint64 lastUpdated, uint8 decimals) {
        PriceData memory d = tokenToPriceData[token];
        return (d.price, d.lastUpdated, d.decimals);
    }

    // Direct single update (EOA)
    function updatePrice(address token, uint128 price) external onlyUpdater {
        uint64 nowTs = uint64(block.timestamp);
        _applyUpdate(token, price, nowTs);
    }

    // Signed single update (EIP-712)
    function updatePriceSigned(
        address token,
        uint128 price,
        uint8 decimals,
        uint64 validUntil,
        uint256 nonce,
        bytes calldata signature
    ) external {
        uint64 nowTs = uint64(block.timestamp);
        if (nowTs > validUntil) revert SignatureExpired(validUntil, nowTs);
        if (usedNonces[nonce]) revert NonceUsed(nonce);

        bytes32 structHash = keccak256(
            abi.encode(
                PRICE_SINGLE_TYPEHASH,
                token,
                price,
                decimals,
                validUntil,
                nonce
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
        address recovered = _recoverSigner(digest, signature);
        if (recovered != signer) revert InvalidSignature();

        usedNonces[nonce] = true;
        // Set token decimals along with price when using signed path (test convenience)
        tokenToPriceData[token].decimals = decimals;
        _applyUpdate(token, price, nowTs);
    }

    // Internal logic shared by both paths
    function _applyUpdate(address token, uint128 price, uint64 nowTs) internal {
        PriceData storage d = tokenToPriceData[token];

        if (d.lastUpdated != 0) {
            uint64 elapsed = nowTs - d.lastUpdated;
            if (elapsed < MIN_UPDATE_INTERVAL) {
                revert CooldownActive(token, d.lastUpdated, nowTs);
            }
        }

        if (maxDeviationBps > 0 && d.price != 0) {
            uint128 oldP = d.price;
            uint256 diff = oldP > price ? uint256(oldP - price) : uint256(price - oldP);
            uint256 maxDiff = (uint256(oldP) * uint256(maxDeviationBps)) / 10_000;
            if (diff > maxDiff) {
                revert ExcessiveDeviation(token, oldP, price, maxDeviationBps);
            }
        }

        d.price = price;
        d.lastUpdated = nowTs;
        emit PriceUpdated(token, price, nowTs, d.decimals);
    }

    function _recoverSigner(bytes32 digest, bytes memory signature) internal pure returns (address) {
        if (signature.length != 65) return address(0);
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }
        if (uint256(s) > 0x7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0) {
            return address(0);
        }
        if (v != 27 && v != 28) {
            return address(0);
        }
        return ecrecover(digest, v, r, s);
    }
}


