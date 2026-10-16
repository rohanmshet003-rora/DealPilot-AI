const { RtcTokenBuilder, RtcRole } = require('agora-token');
const config = require('../config/env');

/**
 * Generate Agora RTC Token for Real-Time Voice Calls
 * @param {string} channelName - The room channel identifier
 * @param {string|number} uid - User identifier (number or string)
 * @param {string} role - 'publisher' (default) or 'subscriber'
 * @param {number} expireSeconds - Optional token validity in seconds
 */
function generateRtcToken(channelName, uid, role = 'publisher', expireSeconds = null) {
  const appId = config.agora.appId;
  const appCertificate = config.agora.appCertificate;

  if (!appId || !appCertificate) {
    throw new Error('Agora App ID and Primary Certificate must be configured.');
  }

  if (!channelName) {
    throw new Error('Channel name is required to generate an Agora RTC token.');
  }

  const expirationTime = expireSeconds || config.agora.tokenExpiration || 7200;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTime;

  const rtcRole = role === 'subscriber' ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;

  let token;
  // If UID is numeric
  if (typeof uid === 'number' || (!isNaN(uid) && !isNaN(parseFloat(uid)))) {
    const numericUid = parseInt(uid, 10);
    token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      numericUid,
      rtcRole,
      privilegeExpiredTs
    );
  } else {
    // If UID is a string account name (e.g. UUID or username)
    const userAccount = String(uid || 'anonymous');
    token = RtcTokenBuilder.buildTokenWithUserAccount(
      appId,
      appCertificate,
      channelName,
      userAccount,
      rtcRole,
      privilegeExpiredTs
    );
  }

  return {
    appId,
    channel: channelName,
    uid,
    token,
    role,
    expiresIn: expirationTime,
    expiresAt: privilegeExpiredTs,
  };
}

module.exports = {
  generateRtcToken,
};
