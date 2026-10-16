/**
 * DealPilot AI - Negotiation Compromise Calculus Engine
 * Evaluates trade-offs between Price, Payment Velocity, and Fulfillment Risk in Indian Rupees (₹).
 */

function formatINR(val) {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  const num = Math.round(Number(val));
  return '₹' + num.toLocaleString('en-IN');
}

function calculateZopa(initialPrice, targetPrice, latestBuyerOffer, latestSellerOffer) {
  const init = parseFloat(initialPrice) || 500000;
  const sellerFloor = targetPrice ? parseFloat(targetPrice) : (init * 0.85);
  const buyerCeiling = init * 1.05;

  const currentBuyerPrice = latestBuyerOffer ? parseFloat(latestBuyerOffer.price) : (init * 0.8);
  const currentSellerPrice = latestSellerOffer ? parseFloat(latestSellerOffer.price) : init;

  const gap = Math.max(0, currentSellerPrice - currentBuyerPrice);
  const midpoint = Math.round((currentSellerPrice + currentBuyerPrice) / 2);

  return {
    sellerFloor,
    buyerCeiling,
    currentBuyerPrice,
    currentSellerPrice,
    gap,
    midpoint,
    formattedGap: formatINR(gap),
    formattedMidpoint: formatINR(midpoint),
    overlapPossible: currentBuyerPrice >= sellerFloor,
  };
}

function generateAlgorithmicCompromises(room, offers = []) {
  const latestBuyer = offers.filter(o => o.sender_role === 'buyer').slice(-1)[0];
  const latestSeller = offers.filter(o => o.sender_role === 'seller').slice(-1)[0];

  const initialPrice = parseFloat(room.initial_price) || 500000;
  const sellerPrice = latestSeller ? parseFloat(latestSeller.price) : initialPrice;
  const buyerPrice = latestBuyer ? parseFloat(latestBuyer.price) : Math.round(initialPrice * 0.82);

  const priceDiff = Math.abs(sellerPrice - buyerPrice);
  const midPrice = Math.round((sellerPrice + buyerPrice) / 2);

  // 1. Balanced Win-Win
  const balancedPrice = midPrice;
  const balanced = {
    packageType: 'balanced',
    title: 'Balanced Win-Win Compromise',
    badge: 'Fair Middle Ground',
    proposedPrice: balancedPrice,
    formattedPrice: formatINR(balancedPrice),
    paymentTerms: '50% Advance via UPI/NEFT, 50% Upon Delivery & Inspection',
    paymentMethod: 'NEFT / RTGS Bank Transfer',
    deliveryMethod: latestSeller?.delivery_method || 'Surface Logistics / Transport',
    deliveryCostBearer: '50/50 Split',
    deliveryDeadlineDays: 7,
    inspectionWindowDays: 14,
    summary: `Equally divides the ${formatINR(priceDiff)} gap at ${formatINR(balancedPrice)}. Pairs 50/50 milestone payment security with shared transport logistics and GST compliance.`,
    concessions: [
      { party: 'Seller Concession', tradeOff: `Reduces price by ${formatINR(sellerPrice - balancedPrice)} from latest quote.` },
      { party: 'Buyer Concession', tradeOff: `Increases offer by ${formatINR(balancedPrice - buyerPrice)} above current bid.` },
      { party: 'Mutual Agreement', tradeOff: '50/50 split on freight charges and a standard 14-day formal inspection window with GST invoice.' },
    ],
    recommendedFor: 'Best when both parties want a prompt, fair resolution without prolonged bargaining rounds.',
  };

  // 2. Seller-Favorable Value Added Package
  const sellerPriceTarget = Math.round(sellerPrice - (priceDiff * 0.3));
  const sellerFavorable = {
    packageType: 'seller_favorable',
    title: 'Seller Margin Protection with Express SLA',
    badge: 'Seller Favorable',
    proposedPrice: sellerPriceTarget,
    formattedPrice: formatINR(sellerPriceTarget),
    paymentTerms: '40% Advance via RTGS, 60% on Verified Dispatch',
    paymentMethod: 'NEFT / RTGS Bank Transfer',
    deliveryMethod: 'Express Air Cargo / Priority Dispatch',
    deliveryCostBearer: 'Seller Pays (100%)',
    deliveryDeadlineDays: 3,
    inspectionWindowDays: 21,
    summary: `Protects seller revenue at ${formatINR(sellerPriceTarget)}. Seller absorbs 100% priority transport charges and extends the warranty inspection window to 21 days.`,
    concessions: [
      { party: 'Seller Concession', tradeOff: 'Absorbs 100% of expedited freight costs and guarantees fast 3-day priority delivery.' },
      { party: 'Buyer Concession', tradeOff: `Accepts price of ${formatINR(sellerPriceTarget)} to receive guaranteed expedited delivery and zero logistics risk.` },
      { party: 'Value Added', tradeOff: 'Extended 21-day verification window with dedicated escalation engineer.' },
    ],
    recommendedFor: 'Best when the buyer is operating under tight timelines and prioritizes rapid delivery and risk mitigation over price cuts.',
  };

  // 3. Buyer-Favorable Liquidity Package
  const buyerPriceTarget = Math.round(buyerPrice + (priceDiff * 0.3));
  const buyerFavorable = {
    packageType: 'buyer_favorable',
    title: 'Instant Cash Liquidity & Maximum Discount',
    badge: 'Buyer Favorable',
    proposedPrice: buyerPriceTarget,
    formattedPrice: formatINR(buyerPriceTarget),
    paymentTerms: '100% Instant Advance Payment via RTGS/IMPS',
    paymentMethod: 'Immediate RTGS / IMPS Bank Transfer',
    deliveryMethod: 'Standard Logistics / Local Pickup',
    deliveryCostBearer: 'Buyer Pays (100%)',
    deliveryDeadlineDays: 10,
    inspectionWindowDays: 7,
    summary: `Offers an aggressive discount down to ${formatINR(buyerPriceTarget)}. In exchange, the buyer releases 100% immediate cash liquidity and assumes all freight arrangements.`,
    concessions: [
      { party: 'Buyer Concession', tradeOff: 'Releases 100% advance funds immediately and assumes all transport expenses.' },
      { party: 'Seller Concession', tradeOff: `Discounts to ${formatINR(buyerPriceTarget)} to eliminate payment collection risk and lock in immediate cashflow.` },
      { party: 'Turnaround', tradeOff: 'Fast 7-day acceptance turnaround to finalize purchase orders.' },
    ],
    recommendedFor: 'Best when the seller requires immediate working capital liquidity and wants to offload fulfillment handling.',
  };

  return [balanced, sellerFavorable, buyerFavorable];
}

module.exports = {
  formatINR,
  calculateZopa,
  generateAlgorithmicCompromises,
};
