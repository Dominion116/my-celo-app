// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MotivationTok is Ownable {
    error InvalidReaction();
    error ArrayLengthMismatch();
    error PaginationOutOfBounds();
    error QuoteNotListed(uint256 quoteId);

    struct QuoteCounters {
        uint64 likes;
        uint64 dislikes;
        uint64 saves;
        uint64 shares;
        uint64 interactions;
    }

    struct UserStreak {
        uint32 current;
        uint32 best;
        uint64 lastActiveDay;
    }

    struct QuoteMeta {
        bool listed;
        string contentURI;
        uint64 createdAt;
    }

    struct QuoteCountersView {
        uint256 quoteId;
        uint256 likes;
        uint256 dislikes;
        uint256 saves;
        uint256 shares;
        uint256 interactions;
    }

    // user => quoteId => reaction (-1 dislike, 0 none, 1 like)
    mapping(address => mapping(uint256 => int8)) private reactions;
    // user => quoteId => saved
    mapping(address => mapping(uint256 => bool)) private savedQuotes;
    // quoteId => counters
    mapping(uint256 => QuoteCounters) private quoteCounters;
    // user => streak
    mapping(address => UserStreak) private streaks;

    // user saved quote ids for UI pagination
    mapping(address => uint256[]) private savedQuoteIds;
    mapping(address => mapping(uint256 => uint256)) private savedQuoteIndexPlusOne;

    // optional quote listing and metadata for frontend discovery
    mapping(uint256 => QuoteMeta) private quoteMeta;
    uint256[] private listedQuoteIds;
    mapping(uint256 => uint256) private listedQuoteIndexPlusOne;

    event QuoteListed(uint256 indexed quoteId, string contentURI, address indexed listedBy);
    event QuoteURIUpdated(uint256 indexed quoteId, string contentURI, address indexed updatedBy);

    event QuoteReactionUpdated(
        address indexed user,
        uint256 indexed quoteId,
        int8 previousReaction,
        int8 newReaction,
        uint256 likes,
        uint256 dislikes,
        uint256 interactions
    );

    event QuoteSavedUpdated(
        address indexed user,
        uint256 indexed quoteId,
        bool isSaved,
        uint256 saves,
        uint256 interactions
    );

    event QuoteShared(address indexed user, uint256 indexed quoteId, uint256 shares, uint256 interactions);

    event VisitRecorded(address indexed user, uint256 indexed dayNumber, uint256 currentStreak, uint256 bestStreak);

    constructor() Ownable(msg.sender) {}

    function listQuote(uint256 quoteId, string calldata contentURI) external onlyOwner {
        _listQuote(quoteId, contentURI);
    }

    function listQuotes(uint256[] calldata quoteIds, string[] calldata uris) external onlyOwner {
        uint256 length = quoteIds.length;
        if (length != uris.length) {
            revert ArrayLengthMismatch();
        }

        for (uint256 i = 0; i < length; i++) {
            _listQuote(quoteIds[i], uris[i]);
        }
    }

    function updateQuoteURI(uint256 quoteId, string calldata contentURI) external onlyOwner {
        QuoteMeta storage meta = quoteMeta[quoteId];
        if (!meta.listed) {
            revert QuoteNotListed(quoteId);
        }

        meta.contentURI = contentURI;
        emit QuoteURIUpdated(quoteId, contentURI, msg.sender);
    }

    function toggleLike(uint256 quoteId) external {
        int8 prev = reactions[msg.sender][quoteId];
        int8 next = prev == 1 ? int8(0) : int8(1);
        _setReaction(msg.sender, quoteId, prev, next);
    }

    function toggleDislike(uint256 quoteId) external {
        int8 prev = reactions[msg.sender][quoteId];
        int8 next = prev == -1 ? int8(0) : int8(-1);
        _setReaction(msg.sender, quoteId, prev, next);
    }

    function clearReaction(uint256 quoteId) external {
        int8 prev = reactions[msg.sender][quoteId];
        _setReaction(msg.sender, quoteId, prev, 0);
    }

    function setReaction(uint256 quoteId, int8 reaction) external {
        if (reaction < -1 || reaction > 1) {
            revert InvalidReaction();
        }

        int8 prev = reactions[msg.sender][quoteId];
        _setReaction(msg.sender, quoteId, prev, reaction);
    }

    function toggleSave(uint256 quoteId) external {
        address user = msg.sender;
        bool isSaved = !savedQuotes[user][quoteId];
        savedQuotes[user][quoteId] = isSaved;

        QuoteCounters storage counters = quoteCounters[quoteId];

        if (isSaved) {
            counters.saves += 1;
            savedQuoteIds[user].push(quoteId);
            savedQuoteIndexPlusOne[user][quoteId] = savedQuoteIds[user].length;
        } else {
            counters.saves -= 1;
            _removeSavedQuote(user, quoteId);
        }

        counters.interactions += 1;
        _recordVisit(user);

        emit QuoteSavedUpdated(user, quoteId, isSaved, counters.saves, counters.interactions);
    }

    function recordShare(uint256 quoteId) external {
        address user = msg.sender;
        QuoteCounters storage counters = quoteCounters[quoteId];
        counters.shares += 1;
        counters.interactions += 1;

        _recordVisit(user);
        emit QuoteShared(user, quoteId, counters.shares, counters.interactions);
    }

    function recordVisit() external {
        _recordVisit(msg.sender);
    }

    function getQuoteCounters(uint256 quoteId)
        external
        view
        returns (uint256 likes, uint256 dislikes, uint256 saves, uint256 shares, uint256 interactions)
    {
        QuoteCounters storage counters = quoteCounters[quoteId];
        return (counters.likes, counters.dislikes, counters.saves, counters.shares, counters.interactions);
    }

    function getBatchQuoteCounters(uint256[] calldata quoteIds) external view returns (QuoteCountersView[] memory data) {
        uint256 length = quoteIds.length;
        data = new QuoteCountersView[](length);

        for (uint256 i = 0; i < length; i++) {
            uint256 quoteId = quoteIds[i];
            QuoteCounters storage counters = quoteCounters[quoteId];
            data[i] = QuoteCountersView({
                quoteId: quoteId,
                likes: counters.likes,
                dislikes: counters.dislikes,
                saves: counters.saves,
                shares: counters.shares,
                interactions: counters.interactions
            });
        }
    }

    function getUserQuoteState(address user, uint256 quoteId)
        external
        view
        returns (bool liked, bool disliked, bool isSaved)
    {
        int8 reaction = reactions[user][quoteId];
        liked = reaction == 1;
        disliked = reaction == -1;
        isSaved = savedQuotes[user][quoteId];
    }

    function getUserStreak(address user)
        external
        view
        returns (uint256 current, uint256 best, uint256 lastActiveDay, uint256 lastActiveTimestamp)
    {
        UserStreak storage streak = streaks[user];
        current = streak.current;
        best = streak.best;
        lastActiveDay = streak.lastActiveDay;
        lastActiveTimestamp = uint256(streak.lastActiveDay) * 1 days;
    }

    function getSavedQuoteIds(address user, uint256 offset, uint256 limit)
        external
        view
        returns (uint256[] memory ids)
    {
        uint256 length = savedQuoteIds[user].length;
        if (offset > length) {
            revert PaginationOutOfBounds();
        }

        uint256 end = offset + limit;
        if (end > length) {
            end = length;
        }

        ids = new uint256[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            ids[i - offset] = savedQuoteIds[user][i];
        }
    }

    function getSavedQuoteCount(address user) external view returns (uint256) {
        return savedQuoteIds[user].length;
    }

    function getListedQuoteIds(uint256 offset, uint256 limit) external view returns (uint256[] memory ids) {
        uint256 length = listedQuoteIds.length;
        if (offset > length) {
            revert PaginationOutOfBounds();
        }

        uint256 end = offset + limit;
        if (end > length) {
            end = length;
        }

        ids = new uint256[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            ids[i - offset] = listedQuoteIds[i];
        }
    }

    function getListedQuoteCount() external view returns (uint256) {
        return listedQuoteIds.length;
    }

    function getQuoteMeta(uint256 quoteId) external view returns (bool listed, string memory contentURI, uint256 createdAt) {
        QuoteMeta storage meta = quoteMeta[quoteId];
        return (meta.listed, meta.contentURI, meta.createdAt);
    }

    function isQuoteSaved(address user, uint256 quoteId) external view returns (bool) {
        return savedQuotes[user][quoteId];
    }

    function getReaction(address user, uint256 quoteId) external view returns (int8) {
        return reactions[user][quoteId];
    }

    function currentDay() external view returns (uint256) {
        return _dayNumber(block.timestamp);
    }

    function _setReaction(address user, uint256 quoteId, int8 prev, int8 next) internal {
        if (next < -1 || next > 1) {
            revert InvalidReaction();
        }

        if (prev == next) {
            return;
        }

        QuoteCounters storage counters = quoteCounters[quoteId];

        if (prev == 1) {
            counters.likes -= 1;
        } else if (prev == -1) {
            counters.dislikes -= 1;
        }

        if (next == 1) {
            counters.likes += 1;
        } else if (next == -1) {
            counters.dislikes += 1;
        }

        reactions[user][quoteId] = next;
        counters.interactions += 1;

        _recordVisit(user);

        emit QuoteReactionUpdated(user, quoteId, prev, next, counters.likes, counters.dislikes, counters.interactions);
    }

    function _removeSavedQuote(address user, uint256 quoteId) internal {
        uint256 indexPlusOne = savedQuoteIndexPlusOne[user][quoteId];
        if (indexPlusOne == 0) {
            return;
        }

        uint256 index = indexPlusOne - 1;
        uint256 lastIndex = savedQuoteIds[user].length - 1;

        if (index != lastIndex) {
            uint256 lastQuoteId = savedQuoteIds[user][lastIndex];
            savedQuoteIds[user][index] = lastQuoteId;
            savedQuoteIndexPlusOne[user][lastQuoteId] = index + 1;
        }

        savedQuoteIds[user].pop();
        delete savedQuoteIndexPlusOne[user][quoteId];
    }

    function _recordVisit(address user) internal {
        uint64 day = uint64(_dayNumber(block.timestamp));
        UserStreak storage streak = streaks[user];

        if (streak.lastActiveDay == day) {
            return;
        }

        if (streak.lastActiveDay + 1 == day) {
            streak.current += 1;
        } else {
            streak.current = 1;
        }

        streak.lastActiveDay = day;

        if (streak.current > streak.best) {
            streak.best = streak.current;
        }

        emit VisitRecorded(user, day, streak.current, streak.best);
    }

    function _dayNumber(uint256 timestamp) internal pure returns (uint256) {
        return timestamp / 1 days;
    }

    function _listQuote(uint256 quoteId, string calldata contentURI) internal {
        QuoteMeta storage meta = quoteMeta[quoteId];
        if (!meta.listed) {
            meta.listed = true;
            meta.createdAt = uint64(block.timestamp);
            listedQuoteIds.push(quoteId);
            listedQuoteIndexPlusOne[quoteId] = listedQuoteIds.length;
        }

        meta.contentURI = contentURI;
        emit QuoteListed(quoteId, contentURI, msg.sender);
    }
}
