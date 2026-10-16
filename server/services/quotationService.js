const crypto = require('crypto');
const { formatINR } = require('./compromiseEngine');

/**
 * Generate a Formal Commercial Quotation Document for a Negotiation Room
 */
function generateCommercialQuotation(room, latestOffer, seller, buyer) {
  const quotePrice = latestOffer ? parseFloat(latestOffer.price) : parseFloat(room.initial_price);
  const gstRate = 0.18; // 18% standard GST for commercial services/machinery in India
  const isInterState = true; // Default IGST
  const gstAmount = Math.round(quotePrice * gstRate);
  const freightAmount = latestOffer?.delivery_cost_bearer === 'Buyer Pays' ? 15000 : latestOffer?.delivery_cost_bearer === '50/50 Split' ? 7500 : 0;
  const grandTotal = quotePrice + gstAmount + freightAmount;

  const quoteId = `DP-QTN-${room.room_code || '8801'}-${Date.now().toString().slice(-4)}`;
  const issueDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const validUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return {
    quoteNumber: quoteId,
    issueDate,
    validUntil,
    status: 'ACTIVE_QUOTATION',
    currency: 'INR',
    vendor: {
      name: seller?.name || 'Authorized Seller Representative',
      company: seller?.company || 'Commercial Vendor Pvt Ltd',
      email: seller?.email || 'vendor@dealpilot.ai',
      gstin: '29AABCU9603R1Z7',
      state: 'Karnataka (Code: 29)',
      pan: 'AABCU9603R',
      bankDetails: {
        bankName: 'HDFC Bank Ltd',
        accountName: seller?.company || 'Commercial Enterprise Account',
        accountNumber: '50200084729103',
        ifscCode: 'HDFC0000240',
        branch: 'Koramangala, Bengaluru',
        upiId: 'dealpilot.payments@okhdfcbank',
      },
    },
    client: {
      name: buyer?.name || 'Authorized Procurement Officer',
      company: buyer?.company || 'Enterprise Client Entity',
      email: buyer?.email || 'procurement@dealpilot.ai',
      billingAddress: 'Corporate Towers, Tech Boulevard, Whitefield, Bengaluru - 560066',
    },
    lineItems: [
      {
        itemNumber: 1,
        title: room.title,
        category: room.category,
        description: room.description || 'Full scope of commercial deliverables per agreed specifications.',
        quantity: 1,
        unit: 'Package / Annual SLA',
        unitRate: quotePrice,
        formattedRate: formatINR(quotePrice),
        baseTotal: quotePrice,
        formattedBaseTotal: formatINR(quotePrice),
      },
    ],
    financialSummary: {
      subtotal: quotePrice,
      formattedSubtotal: formatINR(quotePrice),
      gstRate: '18% GST (IGST)',
      gstAmount: gstAmount,
      formattedGst: formatINR(gstAmount),
      freightCharges: freightAmount,
      formattedFreight: formatINR(freightAmount),
      grandTotal: grandTotal,
      formattedGrandTotal: formatINR(grandTotal),
    },
    termsAndConditions: {
      paymentTerms: latestOffer?.payment_terms || '50% Advance via NEFT/UPI, 50% on Delivery Verification',
      paymentMethod: latestOffer?.payment_method || 'NEFT / RTGS Bank Transfer',
      deliveryMethod: latestOffer?.delivery_method || 'Surface Logistics / Transport',
      deliveryCostBearer: latestOffer?.delivery_cost_bearer || '50/50 Split',
      deliveryDeadline: `${latestOffer?.delivery_deadline_days || 7} Working Days from Purchase Order`,
      inspectionWarranty: `${latestOffer?.inspection_window_days || 14} Calendar Days Verification Window`,
      taxCompliance: 'Tax invoice with 18% Input Tax Credit (ITC) eligibility will be issued upon dispatch.',
      jurisdiction: 'Arbitration and jurisdiction under Commercial Courts Act, Bengaluru / Mumbai.',
    },
    authorizedSignatory: {
      signatoryName: seller?.name || 'Sarah Jenkins',
      designation: 'Authorized Commercial Signatory',
      signed: true,
      timestamp: new Date().toISOString(),
      verificationHash: crypto.createHash('sha256').update(quoteId + grandTotal).digest('hex').substring(0, 16).toUpperCase(),
    },
  };
}

module.exports = {
  generateCommercialQuotation,
};
