import AgoraRTC from 'agora-rtc-sdk-ng';

// Silence Agora verbose logs in development
AgoraRTC.setLogLevel(2); // 0: DEBUG, 1: INFO, 2: WARNING, 3: ERROR

class AgoraVoiceManager {
  constructor() {
    this.client = null;
    this.localAudioTrack = null;
    this.remoteUsers = new Map();
    this.isMuted = false;
    this.isConnected = false;
    this.onVolumeCallback = null;
    this.onUserJoinedCallback = null;
    this.onUserLeftCallback = null;
  }

  initClient() {
    if (!this.client) {
      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      this.setupEventHandlers();
    }
    return this.client;
  }

  setupEventHandlers() {
    this.client.on('user-published', async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);
      if (mediaType === 'audio') {
        user.audioTrack?.play();
        this.remoteUsers.set(user.uid, user);
        if (this.onUserJoinedCallback) {
          this.onUserJoinedCallback(user.uid);
        }
      }
    });

    this.client.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'audio') {
        this.remoteUsers.delete(user.uid);
        if (this.onUserLeftCallback) {
          this.onUserLeftCallback(user.uid);
        }
      }
    });

    this.client.on('user-left', (user) => {
      this.remoteUsers.delete(user.uid);
      if (this.onUserLeftCallback) {
        this.onUserLeftCallback(user.uid);
      }
    });

    this.client.enableAudioVolumeIndicator();
    this.client.on('volume-indicator', (volumes) => {
      if (this.onVolumeCallback) {
        this.onVolumeCallback(volumes);
      }
    });
  }

  async joinCall(appId, channel, token, uid) {
    try {
      this.initClient();
      await this.client.join(appId, channel, token, uid);
      this.isConnected = true;

      // Create & publish local microphone audio track
      try {
        this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          AEC: true, // Acoustic Echo Cancellation
          ANS: true, // Automatic Noise Suppression
          AGC: true, // Automatic Gain Control
        });
        await this.client.publish([this.localAudioTrack]);
      } catch (micErr) {
        console.warn('[AgoraVoiceManager] Microphone hardware or permission issue:', micErr.message);
        // User joined call in listening/speaker mode
      }

      return {
        success: true,
        channel,
        uid,
      };
    } catch (err) {
      console.error('[AgoraVoiceManager] Failed to join call:', err);
      throw err;
    }
  }

  toggleMute() {
    if (this.localAudioTrack) {
      this.isMuted = !this.isMuted;
      this.localAudioTrack.setEnabled(!this.isMuted);
      return this.isMuted;
    }
    return false;
  }

  async leaveCall() {
    try {
      if (this.localAudioTrack) {
        this.localAudioTrack.stop();
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }
      if (this.client) {
        await this.client.leave();
      }
      this.isConnected = false;
      this.isMuted = false;
      this.remoteUsers.clear();
      return true;
    } catch (err) {
      console.error('[AgoraVoiceManager] Leave call error:', err);
      return false;
    }
  }
}

export const agoraVoice = new AgoraVoiceManager();
export default agoraVoice;
