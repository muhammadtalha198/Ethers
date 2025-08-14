// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title PriceAggregator
/// @notice Minimal, gas-conscious price aggregator with a 20-second cooldown per token.
/// - Off-chain updater (keeper/cron) fetches prices from The Graph and either calls updatePrices (EOA auth)
///   or updatePricesSigned (EIP-712 auth with off-chain signatures)
/// - Single authorized updater address; owner can rotate it
/// - EIP-712 signer address to validate signed batches; owner can rotate it
/// - Optional max deviation guard to limit price jumps; owner can force update to recover
contract PriceAggregator {
    // ====== Types ======
    struct PriceData {
        // Scaled integer price (e.g., 8 decimals)
        uint128 price;
        // Last update timestamp (seconds since epoch)
        uint64 lastUpdated;
        // Price decimals for off-chain interpretation
        uint8 decimals;
        // 56 bits unused padding in the storage slot for potential future use
        // Additional metadata
        string name;
    }

    // ====== Storage ======
    mapping(address => PriceData) private tokenToPriceData;

    address public owner;
    address public updater; // EOA allowed to call updatePrices directly
    address public signer;  // Address whose EIP-712 signatures are accepted by updatePricesSigned

    // 20-second minimum interval enforced per token
    uint32 public constant MIN_UPDATE_INTERVAL = 20;

    // If set to > 0, updates that exceed this deviation (in basis points) revert
    // Example: 1,000 = 10% max deviation
    uint16 public maxDeviationBps; // 0 means disabled

    // EIP-712: domain separator and typehashes
    bytes32 private immutable DOMAIN_SEPARATOR;
    bytes32 private constant EIP712_DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 private constant NAME_HASH = keccak256("PriceAggregator");
    bytes32 private constant VERSION_HASH = keccak256("1");
    // We hash arrays off-chain and include them as bytes32 fields to avoid dynamic array type encoding complexities
    // PriceBatch(bytes32 tokensHash,bytes32 pricesHash,bytes32 decimalsHash,bytes32 namesHash,uint64 validUntil,uint256 nonce)
    bytes32 private constant PRICE_BATCH_TYPEHASH = keccak256("PriceBatch(bytes32 tokensHash,bytes32 pricesHash,bytes32 decimalsHash,bytes32 namesHash,uint64 validUntil,uint256 nonce)");

    // Nonce tracking for EIP-712 signed updates to prevent replay
    mapping(uint256 => bool) public usedNonces;

    // ====== Events ======
    event PriceUpdated(address indexed token, uint128 price, uint64 timestamp, uint8 decimals);
    event UpdaterChanged(address indexed newUpdater);
    event OwnerChanged(address indexed newOwner);
    event MaxDeviationBpsChanged(uint16 bps);
    event TokenConfigured(address indexed token, uint8 decimals);

    // ====== Errors ======
    error NotOwner();
    error NotUpdater();
    error LengthMismatch();
    error CooldownActive(address token, uint64 last, uint64 nowTs);
    error ExcessiveDeviation(address token, uint128 oldPrice, uint128 newPrice, uint16 maxDeviationBps);
    error SignatureExpired(uint64 validUntil, uint64 nowTs);
    error InvalidSignature();
    error NonceUsed(uint256 nonce);

    // ====== Modifiers ======
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyUpdater() {
        if (msg.sender != updater) revert NotUpdater();
        _;
    }

    // ====== Constructor ======
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
        emit UpdaterChanged(initialUpdater);
        emit OwnerChanged(msg.sender);
    }

    // ====== Admin ======
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
    }

    function setMaxDeviationBps(uint16 newMaxDeviationBps) external onlyOwner {
        maxDeviationBps = newMaxDeviationBps;
        emit MaxDeviationBpsChanged(newMaxDeviationBps);
    }

    /// @notice Configure price decimals for a single token (for off-chain consumers)
    function setTokenDecimals(address token, uint8 decimals) external onlyOwner {
        tokenToPriceData[token].decimals = decimals;
        emit TokenConfigured(token, decimals);
    }

    /// @notice Batch configure decimals for multiple tokens
    function setTokensDecimals(address[] calldata tokens, uint8[] calldata decimals) external onlyOwner {
        if (tokens.length != decimals.length) revert LengthMismatch();
        for (uint256 i = 0; i < tokens.length; ) {
            tokenToPriceData[tokens[i]].decimals = decimals[i];
            emit TokenConfigured(tokens[i], decimals[i]);
            unchecked { i++; }
        }
    }

    // ====== Views ======
    function getPrice(address token) external view returns (uint128 price, uint64 lastUpdated, uint8 decimals) {
        PriceData memory d = tokenToPriceData[token];
        return (d.price, d.lastUpdated, d.decimals);
    }

    function getRawPriceData(address token) external view returns (PriceData memory) {
        return tokenToPriceData[token];
    }

    // ====== Updates ======
    /// @notice Update prices for multiple tokens in a single transaction.
    /// @dev Enforces per-token 20-second cooldown and optional max deviation.
    ///      Emits PriceUpdated for each successful token update.
    /// @param tokens Token addresses to update.
    /// @param prices Scaled integer prices (match the decimals configured per token).
    function updatePrices(address[] calldata tokens, uint128[] calldata prices) external onlyUpdater {
        if (tokens.length != prices.length) revert LengthMismatch();

        uint64 nowTs = uint64(block.timestamp);
        uint16 deviationBps = maxDeviationBps;

        for (uint256 i = 0; i < tokens.length; ) {
            address token = tokens[i];
            PriceData storage d = tokenToPriceData[token];

            uint64 last = d.lastUpdated;
            if (last != 0) {
                uint64 elapsed = nowTs - last;
                if (elapsed < MIN_UPDATE_INTERVAL) {
                    revert CooldownActive(token, last, nowTs);
                }
            }

            if (deviationBps > 0 && d.price != 0) {
                uint128 oldP = d.price;
                uint128 newP = prices[i];
                uint256 diff = oldP > newP ? uint256(oldP - newP) : uint256(newP - oldP);
                uint256 maxDiff = (uint256(oldP) * uint256(deviationBps)) / 10_000;
                if (diff > maxDiff) {
                    revert ExcessiveDeviation(token, oldP, newP, deviationBps);
                }
            }

            d.price = prices[i];
            d.lastUpdated = nowTs;

            emit PriceUpdated(token, prices[i], nowTs, d.decimals);
            unchecked { i++; }
        }
    }

    /// @notice Owner can force updates bypassing cooldown and deviation checks (for recovery/migrations).
    function forceUpdatePrices(address[] calldata tokens, uint128[] calldata prices) external onlyOwner {
        if (tokens.length != prices.length) revert LengthMismatch();
        uint64 nowTs = uint64(block.timestamp);
        for (uint256 i = 0; i < tokens.length; ) {
            PriceData storage d = tokenToPriceData[tokens[i]];
            d.price = prices[i];
            d.lastUpdated = nowTs;
            emit PriceUpdated(tokens[i], prices[i], nowTs, d.decimals);
            unchecked { i++; }
        }
    }

    // ====== EIP-712 Signed Updates ======
    /// @notice Update prices using an EIP-712 signed batch from the configured signer.
    /// @dev Anyone can submit the signed update; use private mempool relays if you want to keep calldata private until inclusion.
    /// @param tokens Token addresses to update.
    /// @param prices Scaled integer prices (must match provided decimals per token).
    /// @param decimalsArray Price decimals per token for this update; stored on-chain for each token.
    /// @param names Token names per token (for convenience/UX); stored on-chain for each token.
    /// @param validUntil Unix timestamp after which the signature is invalid.
    /// @param nonce Unique nonce to prevent replay across batches.
    /// @param signature EIP-712 signature from `signer` over the typed data.
    function updatePricesSigned(
        address[] calldata tokens,
        uint128[] calldata prices,
        uint8[] calldata decimalsArray,
        string[] calldata names,
        uint64 validUntil,
        uint256 nonce,
        bytes calldata signature
    ) external {
        if (tokens.length != prices.length || tokens.length != decimalsArray.length || tokens.length != names.length) revert LengthMismatch();

        _validateAndConsumeNonce(
            keccak256(abi.encode(tokens)),
            keccak256(abi.encode(prices)),
            keccak256(abi.encode(decimalsArray)),
            keccak256(abi.encode(names)),
            validUntil,
            nonce,
            signature
        );

        _applyBatchUpdates(tokens, prices, decimalsArray, names);
    }

    function _validateAndConsumeNonce(
        bytes32 tokensHash,
        bytes32 pricesHash,
        bytes32 decimalsHash,
        bytes32 namesHash,
        uint64 validUntil,
        uint256 nonce,
        bytes calldata signature
    ) private {
        uint64 nowTs = uint64(block.timestamp);
        if (nowTs > validUntil) revert SignatureExpired(validUntil, nowTs);
        if (usedNonces[nonce]) revert NonceUsed(nonce);

        bytes32 structHash = keccak256(
            abi.encode(
                PRICE_BATCH_TYPEHASH,
                tokensHash,
                pricesHash,
                decimalsHash,
                namesHash,
                validUntil,
                nonce
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
        address recovered = _recoverSigner(digest, signature);
        if (recovered != signer) revert InvalidSignature();

        usedNonces[nonce] = true;
    }

    function _applyBatchUpdateCore(
        address token,
        uint128 newPrice,
        uint64 nowTs,
        uint16 deviationBps,
        bool skipDeviation,
        uint8 eventDecimals
    ) private {
        PriceData storage d = tokenToPriceData[token];

        uint64 last = d.lastUpdated;
        if (last != 0) {
            if (nowTs - last < MIN_UPDATE_INTERVAL) {
                revert CooldownActive(token, last, nowTs);
            }
        }

        if (!skipDeviation && deviationBps > 0 && d.price != 0) {
            uint128 oldP = d.price;
            uint256 diff = oldP > newPrice ? uint256(oldP - newPrice) : uint256(newPrice - oldP);
            uint256 maxDiff = (uint256(oldP) * uint256(deviationBps)) / 10_000;
            if (diff > maxDiff) {
                revert ExcessiveDeviation(token, oldP, newPrice, deviationBps);
            }
        }

        d.price = newPrice;
        d.lastUpdated = nowTs;
        emit PriceUpdated(token, newPrice, nowTs, eventDecimals);
    }

    function _applyBatchUpdates(
        address[] calldata tokens,
        uint128[] calldata prices,
        uint8[] calldata decimalsArray,
        string[] calldata names
    ) private {
        uint64 nowTs = uint64(block.timestamp);
        uint16 deviationBps = maxDeviationBps;
        for (uint256 i = 0; i < tokens.length; ) {
            address token = tokens[i];
            PriceData storage d = tokenToPriceData[token];
            bool skipDeviation = (d.price == 0) || (d.decimals != decimalsArray[i]);
            d.name = names[i];
            d.decimals = decimalsArray[i];
            _applyBatchUpdateCore(token, prices[i], nowTs, deviationBps, skipDeviation, decimalsArray[i]);
            unchecked { i++; }
        }
    }

    // Lightweight ECDSA recover
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
        // EIP-2 malleability check: s must be in lower half order
        if (uint256(s) > 0x7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0) {
            return address(0);
        }
        if (v != 27 && v != 28) {
            return address(0);
        }
        return ecrecover(digest, v, r, s);
    }
}


