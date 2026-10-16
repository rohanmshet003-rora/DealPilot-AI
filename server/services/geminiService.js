const { GoogleGenAI } = require('@google/genai');
const config = require('../config/env');
const { formatINR, calculateZopa, generateAlgorithmicCompromises } = require('./compromiseEngine');

let genAiClient = null;

function getGenAiClient() {
  if (!genAiClient && config.gemini.apiKey) {
    try {
      genAiClient = new GoogleGenAI({ apiKey: config.gemini.apiKey });
    } catch (err) {
      console.warn('[GeminiService] Could not instantiate GoogleGenAI client:', err.message);
    }
  }
  return genAiClient;
}

const SYSTEM_PROMPT = `
You are DealPilot AI, an elite commercial negotiation copilot and mediation strategist.
Your purpose: "Negotiate Smarter. Deal Better. Close with Confidence."
You operate in Indian Rupees (₹ - INR) for commercial Indian and international transactions.
Always organize negotiation analysis in a systematic, step-by-step order:
Step 1: Deal Health & Leverage Position
Step 2: Valuation Gap Breakdown (Seller Quote vs Buyer Offer vs Equilibrium)
Step 3: 3-Phase Tactical Execution Plan (Anchor -> Trade-Off Concession -> Close)
Step 4: Recommended Counteroffer Package (Price in ₹, Payment Terms, Delivery Terms)
Step 5: Ready-to-Send Negotiation Dialogue Script (for Room Chat and Agora Voice Call)
Step 6: Pre-Signing Safety Checklist (GST Invoice, Payment Milestone, Inspection SLA)
`;

/**
 * Analyze Current Negotiation State with Systematic Ordered Output
 */
async function analyzeNegotiation(room, offers = [], messages = [], currentRole = 'buyer') {
  const client = getGenAiClient();
  const latestBuyer = offers.filter(o => o.sender_role === 'buyer').slice(-1)[0];
  const latestSeller = offers.filter(o => o.sender_role === 'seller').slice(-1)[0];
  const zopa = calculateZopa(room.initial_price, room.target_price, latestBuyer, latestSeller);

  const initial = parseFloat(room.initial_price) || 500000;
  const sellerP = latestSeller ? parseFloat(latestSeller.price) : initial;
  const buyerP = latestBuyer ? parseFloat(latestBuyer.price) : Math.round(initial * 0.82);
  const gap = Math.abs(sellerP - buyerP);
  const isBuyer = currentRole === 'buyer';

  const prompt = `
Negotiation Context (in Indian Rupees - ₹):
- Asset / Deal: "${room.title}" (${room.category})
- Currency: ${room.currency || 'INR'} (₹)
- Initial Price: ${formatINR(initial)}
- User Perspective: ${currentRole.toUpperCase()}
- Latest Seller Offer: ${latestSeller ? formatINR(sellerP) : 'Not submitted yet'}
- Latest Buyer Offer: ${latestBuyer ? formatINR(buyerP) : 'Not submitted yet'}
- Gap: ${formatINR(gap)}
- Recent Exchanges: ${messages.slice(-3).map(m => `${m.sender_name} (${m.sender_role}): "${m.content}"`).join(' | ') || 'None'}

Please provide a systematic negotiation analysis in JSON format with exact keys:
{
  "step1_health": {
    "leverageScore": (0-100),
    "leverageStatus": "Strong" | "Balanced" | "Cautious",
    "summary": "Clear, plain-English summary of current bargaining standing"
  },
  "step2_gap": {
    "sellerPrice": "${formatINR(sellerP)}",
    "buyerPrice": "${formatINR(buyerP)}",
    "valuationGap": "${formatINR(gap)}",
    "equilibriumPrice": "${formatINR(Math.round((sellerP + buyerP) / 2))}",
    "analysis": "Explanation of the price divergence"
  },
  "step3_strategy": {
    "phase1_anchor": "How to anchor your position firmly",
    "phase2_concession": "Specific non-cash trade-off (e.g. payment velocity, transport, warranty)",
    "phase3_close": "How to ask for final approval and sign-off"
  },
  "step4_recommendation": {
    "counterPrice": (number),
    "formattedCounterPrice": "string with ₹",
    "paymentTerms": "e.g. 50% Advance via UPI/NEFT, 50% on Delivery",
    "deliveryTerms": "e.g. Standard Freight (50/50 Shared Cost)",
    "inspectionDays": 14,
    "rationale": "Clear commercial justification"
  },
  "step5_scripts": {
    "chatScript": "Word-for-word message to copy and paste into negotiation chat",
    "voiceCallScript": "Word-for-word script to speak during the Agora voice call"
  },
  "step6_checklist": [
    "Checklist item 1 (e.g. Verify GST input tax credit)",
    "Checklist item 2 (e.g. Confirm 50/50 payment milestone escrow)",
    "Checklist item 3 (e.g. Agree on 14-day formal inspection window)"
  ]
}
Return only valid JSON.
`;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: config.gemini.model || 'gemini-2.5-flash',
        contents: prompt,
        config: { systemInstruction: SYSTEM_PROMPT },
      });

      const responseText = response.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          source: 'gemini-live',
          model: config.gemini.model,
          leverageScore: parsed.step1_health?.leverageScore || parsed.leverageScore || 55,
          tacticalPosture: parsed.step3_strategy?.phase1_anchor || parsed.tacticalPosture || 'Balanced Negotiation',
          ...parsed,
          zopa,
        };
      }
    } catch (err) {
      console.warn(`[GeminiService] Live Gemini API skipped (${err.message}). Using systematic DealPilot AI engine.`);
    }
  }

  // Systematic Algorithmic Fallback Engine (Engineered for Indian Rupee Commercial Negotiations)
  let leverageScore = isBuyer ? (offers.length > 2 ? 65 : 55) : (offers.length > 2 ? 60 : 68);
  if (gap / initial > 0.2) leverageScore += 4;
  leverageScore = Math.min(90, Math.max(38, leverageScore));

  const leverageStatus = leverageScore >= 65 ? 'Strong Advantage' : leverageScore >= 50 ? 'Balanced Position' : 'Caution Required';

  const targetCounter = isBuyer
    ? Math.round(buyerP + (gap * 0.42))
    : Math.round(sellerP - (gap * 0.38));

  return {
    source: 'dealpilot-ai-engine',
    model: 'DealPilot Systematic Negotiation Engine v2.5',
    zopa,
    leverageScore,
    tacticalPosture: `${leverageStatus}: ${isBuyer ? 'Value-Trading & Milestone Anchoring' : 'Value-Preservation with Terms Flexibility'}`,
    step1_health: {
      leverageScore,
      leverageStatus,
      summary: isBuyer
        ? `As the Buyer, you hold a ${leverageStatus.toLowerCase()} (${leverageScore}/100). The seller is actively engaged. You can leverage payment speed (e.g. prompt UPI/NEFT advances) to close the ${formatINR(gap)} gap.`
        : `As the Seller, you hold a ${leverageStatus.toLowerCase()} (${leverageScore}/100) anchored by immediate asset availability. Structuring a 50/50 milestone payment will protect your price floor.`,
    },
    step2_gap: {
      sellerPrice: formatINR(sellerP),
      buyerPrice: formatINR(buyerP),
      valuationGap: formatINR(gap),
      equilibriumPrice: formatINR(Math.round((sellerP + buyerP) / 2)),
      analysis: `The current valuation difference is ${formatINR(gap)}. The natural commercial midpoint is ${formatINR(Math.round((sellerP + buyerP) / 2))}, which represents a realistic, mutually profitable target.`,
    },
    step3_strategy: {
      phase1_anchor: isBuyer
        ? `Anchor at ${formatINR(targetCounter)} as your approved procurement ceiling for this transaction.`
        : `Hold firm near ${formatINR(targetCounter)}, reinforcing enterprise quality and certified delivery SLA.`,
      phase2_concession: isBuyer
        ? `Offer 50% advance payment via instant NEFT/RTGS and agree to split local freight charges 50/50.`
        : `Concede to 50/50 milestone payment and include a 14-day warranty inspection window with GST invoice.`,
      phase3_close: isBuyer
        ? `Request immediate sign-off on the DealPilot Bilateral Agreement to release the advance purchase order today.`
        : `Offer to issue the official commercial quotation immediately upon their confirmation of this price.`,
    },
    step4_recommendation: {
      counterPrice: targetCounter,
      formattedCounterPrice: formatINR(targetCounter),
      paymentTerms: '50% Advance via NEFT / UPI, 50% on Delivery Verification',
      deliveryTerms: 'Surface Logistics / Transport (50/50 Freight Cost Split)',
      inspectionDays: 14,
      rationale: isBuyer
        ? `A counter of ${formatINR(targetCounter)} saves ${formatINR(sellerP - targetCounter)} while offering the seller verified payment security.`
        : `Meeting at ${formatINR(targetCounter)} secures a viable gross margin while removing the buyer's budget roadblock.`,
    },
    step5_scripts: {
      chatScript: isBuyer
        ? `Namaste! We reviewed the proposal carefully. To close this deal today, we can offer ${formatINR(targetCounter)} paired with a 50% advance via NEFT/RTGS and 50% on verified delivery. This matches our approved budget so we can sign the agreement immediately.`
        : `Namaste! Thank you for the offer. In the spirit of a strong partnership, we can revise our price to ${formatINR(targetCounter)} with 50/50 milestone terms and shared freight. We are ready to execute the agreement and dispatch without delay.`,
      voiceCallScript: isBuyer
        ? `"We are genuinely interested and want to move forward today. If you can meet us at ${formatINR(targetCounter)} with 50/50 milestone payment protection, we will digitally sign the agreement and release the purchase order right away."`
        : `"We want to make this work for your budget. If we agree on ${formatINR(targetCounter)}, we will absorb our half of the transport logistics and provide a full 14-day inspection guarantee with GST invoice."`,
    },
    step6_checklist: [
      'Verify GST Identification Number (GSTIN) for Input Tax Credit eligibility.',
      'Ensure payment milestones are linked to verified delivery receipt.',
      'Confirm the 14-day inspection and dispute resolution window.',
      'Review the itemized commercial quotation before mutual contract execution.',
    ],
  };
}

/**
 * Generate Smart Compromise Packages (in INR)
 */
async function generateCompromises(room, offers = []) {
  const client = getGenAiClient();
  const algorithmicPackages = generateAlgorithmicCompromises(room, offers);

  if (client) {
    try {
      const prompt = `
DealPilot AI Compromise Generation in Indian Rupees (₹):
Room Title: "${room.title}"
Category: ${room.category}
Currency: INR (₹)
Initial Price: ${room.initial_price}

Generate 3 creative, realistic compromise packages in JSON format:
1. Balanced (splits price gap evenly, 50/50 payment milestones and shared freight)
2. Seller Favorable (higher price, but seller absorbs express delivery and extends warranty)
3. Buyer Favorable (lower price, but buyer pays 100% upfront via RTGS and covers transport)

JSON format:
{
  "packages": [
    {
      "packageType": "balanced" | "seller_favorable" | "buyer_favorable",
      "title": "string",
      "badge": "string",
      "proposedPrice": number,
      "formattedPrice": "string with ₹",
      "paymentTerms": "string",
      "paymentMethod": "string",
      "deliveryMethod": "string",
      "deliveryCostBearer": "string",
      "deliveryDeadlineDays": number,
      "inspectionWindowDays": number,
      "summary": "string",
      "concessions": [{"party": "string", "tradeOff": "string"}],
      "recommendedFor": "string"
    }
  ]
}
Return only valid JSON.
`;
      const response = await client.models.generateContent({
        model: config.gemini.model || 'gemini-2.5-flash',
        contents: prompt,
        config: { systemInstruction: SYSTEM_PROMPT },
      });

      const responseText = response.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.packages && parsed.packages.length >= 3) {
          return parsed.packages.map(p => ({
            ...p,
            formattedPrice: p.formattedPrice || formatINR(p.proposedPrice),
          }));
        }
      }
    } catch (err) {
      console.warn(`[GeminiService] Live compromise prompt failed (${err.message}). Using algorithmic compromise engine.`);
    }
  }

  return algorithmicPackages;
}

/**
 * Interactive Copilot Chat with Gemini (in INR)
 */
async function chatWithCopilot(room, offers = [], userRole = 'buyer', userQuery = '') {
  const client = getGenAiClient();
  const latestBuyer = offers.filter(o => o.sender_role === 'buyer').slice(-1)[0];
  const latestSeller = offers.filter(o => o.sender_role === 'seller').slice(-1)[0];

  const prompt = `
You are DealPilot AI, acting as the confidential strategic negotiation advisor for the ${userRole.toUpperCase()} in India.
Asset: "${room.title}" (${room.category})
Currency: INR (₹)
Latest Seller Offer: ${latestSeller ? formatINR(latestSeller.price) : 'None'}
Latest Buyer Offer: ${latestBuyer ? formatINR(latestBuyer.price) : 'None'}

The ${userRole} asks:
"${userQuery}"

Provide a crisp, tactical response organized into:
1. Strategic Advice (plain English, actionable)
2. Exact Dialogue Script (what to say/type in room)
3. Non-Cash Concession Idea (payment milestone, GST, transport)
`;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: config.gemini.model || 'gemini-2.5-flash',
        contents: prompt,
        config: { systemInstruction: SYSTEM_PROMPT },
      });
      return { reply: response.text, source: 'gemini-live' };
    } catch (err) {
      console.warn(`[GeminiService] Copilot chat error (${err.message}). Using contextual fallback.`);
    }
  }

  const isBuyer = userRole === 'buyer';
  return {
    source: 'dealpilot-ai-engine',
    reply: `### DealPilot AI Strategy for ${isBuyer ? 'Buyer' : 'Seller'}

**1. Strategic Advice:**
Do not reject their counteroffer directly. Instead, link any price movement to a corresponding concession on payment terms or transport costs.

**2. Ready-to-Send Script:**
> *"We understand your position and appreciate the transparency. We can agree to your proposed price if we can structure this as a 50% advance via NEFT and 50% upon verified delivery with standard GST invoice. That allows our finance team to approve this today."*

**3. Recommended Non-Cash Trade-Offs:**
- **Payment Structure:** Offer faster disbursement upon delivery verification rather than 100% advance.
- **Freight & Logistics:** Propose a 50/50 freight split to save on shipping costs.
- **Speed Incentive:** Commit to signing the DealPilot agreement and releasing the purchase order within 24 hours.`,
  };
}

module.exports = {
  formatINR,
  analyzeNegotiation,
  generateCompromises,
  chatWithCopilot,
};
