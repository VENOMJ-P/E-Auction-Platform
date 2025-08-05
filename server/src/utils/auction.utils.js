export function validateBid(auction, amount) {
  if (amount <= 0) {
    return { valid: false, message: "Bid amount must be positive" };
  }

  if (amount < auction.base_price) {
    return {
      valid: false,
      message: `Bid must be at least ${auction.base_price}`,
    };
  }

  if (auction.bid_type === "HIGHEST") {
    if (auction.current_bid && amount <= auction.current_bid) {
      return {
        valid: false,
        message: `Bid must be higher than current bid of ${auction.current_bid}`,
      };
    }
  } else {
    if (auction.current_bid && amount >= auction.current_bid) {
      return {
        valid: false,
        message: `Bid must be lower than current bid of ${auction.current_bid}`,
      };
    }
  }

  return { valid: true };
}

export function getUserPosition(auction, userId) {
  const userBid = auction.bids.find(
    (bid) => bid.user_id.toString() === userId.toString()
  );
  if (!userBid) return null;

  const sortedBids = auction.bids.sort((a, b) =>
    auction.bid_type === "HIGHEST" ? b.amount - a.amount : a.amount - b.amount
  );

  const position =
    sortedBids.findIndex(
      (bid) => bid.user_id.toString() === userId.toString()
    ) + 1;
  return {
    position,
    amount: userBid.amount,
    isWinning: position === 1,
  };
}
