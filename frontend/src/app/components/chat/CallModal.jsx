import React, { useState, useEffect, useRef } from "react";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, PhoneCall } from "lucide-react";
import { initSocket, getSocket } from "../../../sockets/socket";

export default function CallModal({ call, currentUserId, onClose }) {
  const { id: callId, type, role, chat } = call;
  const [status, setStatus] = useState(role === "caller" ? "ringing" : "incoming"); // ringing, incoming, active, ended
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(type === "audio");
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [seconds, setSeconds] = useState(0);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const timerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const simulatedStreamCleanupRef = useRef(null);
  const ringtoneCleanupRef = useRef(null);
  const iceCandidatesQueueRef = useRef([]);

  const [socket, setSocket] = useState(null);

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" }
    ]
  };

  // Synthesize telephone ringback sound (drin drin...) for caller
  const playRingtone = () => {
    console.log("📞 WebRTC [Audio]: Playing synthesized outgoing ringtone...");
    let audioCtx;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
    
    let isPlaying = true;
    
    const playRingCycle = () => {
      if (!isPlaying) return;
      
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc1.frequency.value = 440;
      osc2.frequency.value = 480;
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + 1.8);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2.0);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc1.start();
      osc2.start();
      
      setTimeout(() => {
        try {
          osc1.stop();
          osc2.stop();
        } catch (e) {}
      }, 2100);
    };

    playRingCycle();
    const intervalId = setInterval(playRingCycle, 4000);

    return () => {
      isPlaying = false;
      clearInterval(intervalId);
      try {
        audioCtx.close();
      } catch (e) {}
    };
  };

  // Synthesize high-pitch alert pulse sound for incoming calls
  const playIncomingRing = () => {
    console.log("📞 WebRTC [Audio]: Playing synthesized incoming call alert...");
    let audioCtx;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
    
    let isPlaying = true;
    
    const playAlertCycle = () => {
      if (!isPlaying) return;
      
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc1.frequency.value = 450;
      osc2.frequency.value = 600;
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.03, audioCtx.currentTime + 0.3);
      gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.35);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.6);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc1.start();
      osc2.start();
      
      setTimeout(() => {
        try {
          osc1.stop();
          osc2.stop();
        } catch (e) {}
      }, 700);
    };

    playAlertCycle();
    const intervalId = setInterval(playAlertCycle, 1500);

    return () => {
      isPlaying = false;
      clearInterval(intervalId);
      try {
        audioCtx.close();
      } catch (e) {}
    };
  };

  // Control synthesized sounds based on calling status
  useEffect(() => {
    if (ringtoneCleanupRef.current) {
      ringtoneCleanupRef.current();
      ringtoneCleanupRef.current = null;
    }

    if (status === "ringing") {
      ringtoneCleanupRef.current = playRingtone();
    } else if (status === "incoming") {
      ringtoneCleanupRef.current = playIncomingRing();
    }

    return () => {
      if (ringtoneCleanupRef.current) {
        ringtoneCleanupRef.current();
        ringtoneCleanupRef.current = null;
      }
    };
  }, [status]);

  // Simulated Media Stream fallback (for non-localhost, non-HTTPS, or permission blocks)
  const getSimulatedStream = () => {
    console.log("📞 WebRTC [Simulated]: Generating fallback stream (Canvas & Oscillator)...");
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    
    let angle = 0;
    const intervalId = setInterval(() => {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, 320, 240);
      
      const grad = ctx.createRadialGradient(160, 120, 10, 160, 120, 80);
      grad.addColorStop(0, "#a855f7");
      grad.addColorStop(1, "#3b82f6");
      ctx.fillStyle = grad;
      ctx.beginPath();
      
      const x = 160 + Math.cos(angle) * 30;
      const y = 120 + Math.sin(angle) * 30;
      ctx.arc(x, y, 40, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(chat?.name || "Spike Call", 160, 200);
      
      angle += 0.05;
    }, 33);

    const videoTrack = canvas.captureStream(30).getVideoTracks()[0];

    let audioTrack;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const dest = audioCtx.createMediaStreamDestination();
      osc.connect(dest);
      osc.start();
      audioTrack = dest.stream.getAudioTracks()[0];
      canvas.dataset.audioContext = audioCtx;
    } catch (e) {
      console.warn("📞 WebRTC [Simulated]: Web Audio oscillator failed:", e);
    }

    const tracks = [];
    if (videoTrack) tracks.push(videoTrack);
    if (audioTrack) tracks.push(audioTrack);
    
    return {
      stream: new MediaStream(tracks),
      cleanup: () => {
        clearInterval(intervalId);
        if (canvas.dataset.audioContext) {
          try {
            canvas.dataset.audioContext.close();
          } catch (e) { }
        }
        tracks.forEach(track => track.stop());
      }
    };
  };

  useEffect(() => {
    const activeSocket = initSocket() || getSocket();
    setSocket(activeSocket);
    console.log("📞 WebRTC: Socket client connected/loaded:", activeSocket?.id);
  }, []);

  useEffect(() => {
    if (!socket) return;

    console.log("📞 WebRTC: Joining call room:", `call_${callId}`);
    socket.emit("joinCallRoom", { callId });

    const handleCallAccepted = (acceptedData) => {
      if (acceptedData?.callId !== callId) return;

      console.log("📞 WebRTC: callAccepted event received. Establishing connections...");
      setStatus("active");
      if (role === "caller") {
        initiateWebRTC();
      }
    };

    const handleCallRejected = (rejectedData) => {
      if (rejectedData?.callId !== callId) return;
      console.log("📞 WebRTC: callRejected event received. Closing modal.");
      setStatus("ended");
      cleanup();
      setTimeout(onClose, 1500);
    };

    const handleCallEnded = (endedData) => {
      if (endedData?.callId !== callId) return;
      console.log("📞 WebRTC: callEnded event received. Disconnecting...");
      setStatus("ended");
      cleanup();
      setTimeout(onClose, 1500);
    };

    const handleSignal = async ({ signal, from }) => {
      if (from === currentUserId) return;

      console.log("📞 WebRTC: Received signal update from user:", from, signal);

      try {
        if (!peerConnectionRef.current) {
          console.log("📞 WebRTC: Initializing peer connection for incoming signal...");
          setupPeerConnection();
        }

        const pc = peerConnectionRef.current;

        if (signal.type && signal.sdp) {
          const sdpObj = new RTCSessionDescription({ type: signal.type, sdp: signal.sdp });
          console.log(`📞 WebRTC: Setting remote description (${sdpObj.type})...`);
          await pc.setRemoteDescription(sdpObj);

          // Remote description is set. Process queued ICE candidates!
          console.log(`📞 WebRTC: Processing ${iceCandidatesQueueRef.current.length} queued ICE candidates...`);
          while (iceCandidatesQueueRef.current.length > 0) {
            const cand = iceCandidatesQueueRef.current.shift();
            try {
              await pc.addIceCandidate(cand);
            } catch (e) {
              console.warn("📞 WebRTC: Error adding queued candidate:", e.message);
            }
          }

          if (sdpObj.type === "offer") {
            console.log("📞 WebRTC: SDP type is offer. Creating SDP answer...");
            let stream = localStreamRef.current;
            if (!stream) {
              try {
                stream = await navigator.mediaDevices.getUserMedia({
                  audio: true,
                  video: type === "video"
                });
              } catch (e) {
                console.warn("📞 WebRTC: mediaDevices.getUserMedia blocked, fallback active:", e.message);
                const sim = getSimulatedStream();
                stream = sim.stream;
                simulatedStreamCleanupRef.current = sim.cleanup;
              }
              localStreamRef.current = stream;
              if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
              }
            }

            if (stream) {
              stream.getTracks().forEach((track) => {
                const alreadyAdded = pc.getSenders().some((s) => s.track === track);
                if (!alreadyAdded) {
                  pc.addTrack(track, stream);
                }
              });
            }

            const answer = await pc.createAnswer();
            console.log("📞 WebRTC: Setting local description and emitting answer...");
            await pc.setLocalDescription(answer);

            socket.emit("webrtcSignal", {
              callId,
              signal: {
                type: pc.localDescription.type,
                sdp: pc.localDescription.sdp
              }
            });
          }
        } else if (signal.candidate) {
          const candidateObj = new RTCIceCandidate({
            candidate: signal.candidate,
            sdpMid: signal.sdpMid,
            sdpMLineIndex: signal.sdpMLineIndex,
          });

          if (pc.remoteDescription) {
            console.log("📞 WebRTC: Adding remote ICE Candidate directly...");
            await pc.addIceCandidate(candidateObj);
          } else {
            console.log("📞 WebRTC: Remote description is null. Queueing ICE candidate...");
            iceCandidatesQueueRef.current.push(candidateObj);
          }
        }
      } catch (err) {
        console.error("📞 WebRTC Error [Signaling]:", err.message);
      }
    };

    socket.on("callAccepted", handleCallAccepted);
    socket.on("callRejected", handleCallRejected);
    socket.on("callEnded", handleCallEnded);
    socket.on("webrtcSignal", handleSignal);

    return () => {
      socket.off("callAccepted", handleCallAccepted);
      socket.off("callRejected", handleCallRejected);
      socket.off("callEnded", handleCallEnded);
      socket.off("webrtcSignal", handleSignal);
      cleanup();
    };
  }, [callId, role, socket, currentUserId]);

  // Duration Timer
  useEffect(() => {
    if (status === "active") {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);
  // Handle local audio track mute toggle
  useEffect(() => {
    if (localStreamRef.current) {
      console.log("📞 WebRTC: Mute state toggled to:", isMuted);
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  // Handle local video track camera toggle
  useEffect(() => {
    if (localStreamRef.current) {
      console.log("📞 WebRTC: Camera state toggled to:", isCamOff);
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !isCamOff;
      });
    }
  }, [isCamOff]);
  const setupPeerConnection = () => {
    console.log("📞 WebRTC: Setting up peer connection...");
    const pc = new RTCPeerConnection(iceServers);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        console.log("📞 WebRTC: Local ICE candidate gathered. Emitting via socket...");
        socket.emit("webrtcSignal", {
          callId,
          signal: {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
          }
        });
      }
    };

    pc.ontrack = (event) => {
      console.log("📞 WebRTC: Received remote stream track event!");
      if (event.streams && event.streams[0]) {
        remoteStreamRef.current = event.streams[0];
        if (type === "video" && remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          console.log("📞 WebRTC: Remote video element srcObject bound.");
        } else if (type === "audio" && remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
          console.log("📞 WebRTC: Remote audio element srcObject bound.");
        }
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const initiateWebRTC = async () => {
    console.log("📞 WebRTC: Caller initiating WebRTC handshake offer...");
    try {
      const pc = setupPeerConnection();
      let localStream;
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: type === "video"
        });
      } catch (mediaErr) {
        console.warn("📞 WebRTC: mediaDevices.getUserMedia blocked, fallback active:", mediaErr.message);
        const sim = getSimulatedStream();
        localStream = sim.stream;
        simulatedStreamCleanupRef.current = sim.cleanup;
      }

      localStreamRef.current = localStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

      const offer = await pc.createOffer();
      console.log("📞 WebRTC: Setting local description and emitting offer...");
      await pc.setLocalDescription(offer);

      socket.emit("webrtcSignal", {
        callId,
        signal: {
          type: pc.localDescription.type,
          sdp: pc.localDescription.sdp
        }
      });
    } catch (err) {
      console.error("📞 WebRTC: initiateWebRTC failed:", err.message);
      setStatus("active");
    }
  };

  const prepareReceiverWebRTC = async () => {
    console.log("📞 WebRTC: Receiver preparing WebRTC tracks...");
    try {
      const pc = setupPeerConnection();
      let localStream;
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: type === "video"
        });
      } catch (mediaErr) {
        console.warn("📞 WebRTC: mediaDevices.getUserMedia blocked, fallback active:", mediaErr.message);
        const sim = getSimulatedStream();
        localStream = sim.stream;
        simulatedStreamCleanupRef.current = sim.cleanup;
      }

      localStreamRef.current = localStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    } catch (err) {
      console.warn("📞 WebRTC: Receiver stream setup error:", err.message);
    }
  };

  const acceptCall = () => {
    if (socket) {
      console.log("📞 WebRTC: acceptCall clicked. Answering socket call...");
      socket.emit("answerCall", { callId, userId: currentUserId });
      setStatus("active");
      prepareReceiverWebRTC();
    }
  };

  const rejectCall = () => {
    if (socket) {
      console.log("📞 WebRTC: rejectCall clicked.");
      socket.emit("rejectCall", { callId });
    }
    onClose();
  };

  const endCall = () => {
    if (socket) {
      console.log("📞 WebRTC: endCall clicked.");
      socket.emit("endCall", { callId });
    }
    cleanup();
    onClose();
  };

  const cleanup = () => {
    console.log("📞 WebRTC: Cleaning up media streams and peer connections...");
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (simulatedStreamCleanupRef.current) {
      simulatedStreamCleanupRef.current();
    }
    if (ringtoneCleanupRef.current) {
      ringtoneCleanupRef.current();
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const nameInitials = chat?.name?.replace(/^[#\s👥\s]*/g, "")?.charAt(0) || "C";

  return (
    <div className="fixed inset-0 z-[9999] bg-neutral-950/95 backdrop-blur-2xl flex flex-col items-center justify-between py-12 px-6 text-white select-none animate-fade-in">
      {/* Hidden audio element for remote audio stream playback */}
      <audio ref={remoteAudioRef} autoPlay className="hidden" />

      {/* Call details */}
      <div className="flex flex-col items-center text-center mt-6">
        <span className="text-[10px] uppercase font-bold tracking-widest bg-white/10 px-3 py-1 rounded-full text-purple-300 border border-white/5 animate-pulse mb-3">
          {type === "video" ? "🎥 Video Call" : "📞 Audio Call"}
        </span>
        <h2 className="text-2xl font-black text-white tracking-tight">{chat?.name}</h2>
        <p className="text-xs text-neutral-400 font-medium mt-1">
          {status === "connecting" || status === "ringing"
            ? "Ringing..."
            : status === "incoming"
              ? "Incoming Call"
              : status === "ended"
                ? "Call Ended"
                : `Ongoing • ${formatTime(seconds)}`}
        </p>
      </div>

      {/* Main Stream Area */}
      <div className="relative flex-1 flex items-center justify-center w-full max-w-md my-8">
        {status === "incoming" ? (
          /* Incoming Call Dialog View */
          <div className="flex flex-col items-center gap-6 bg-card border border-border p-8 rounded-3xl text-center shadow-2xl backdrop-blur-md max-w-xs animate-slide-up text-foreground">
            <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg border border-white/10 select-none">
              {nameInitials}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Accept call request from <span className="font-bold text-foreground">{chat?.name}</span>
            </p>
            <div className="flex items-center gap-4 w-full">
              <button
                onClick={rejectCall}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 font-bold text-xs active:scale-95 transition cursor-pointer text-white border-none outline-none"
              >
                Decline
              </button>
              <button
                onClick={acceptCall}
                className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 font-bold text-xs active:scale-95 transition cursor-pointer text-white flex items-center justify-center gap-1.5 border-none outline-none"
              >
                <PhoneCall size={12} /> Answer
              </button>
            </div>
          </div>
        ) : type === "video" && status === "active" ? (
          /* Video Stream Output */
          <div className="w-full h-full max-h-[360px] rounded-3xl overflow-hidden border border-border bg-neutral-900 shadow-2xl relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Fallback canvas backdrop */}
            {!remoteStreamRef.current && (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 flex items-center justify-center">
                <span className="text-lg font-bold text-white/50 tracking-wider">Opponent Stream</span>
              </div>
            )}
            {/* User own overlay camera preview */}
            <div className="absolute bottom-4 right-4 w-28 h-36 rounded-2xl overflow-hidden border border-white/15 bg-neutral-950 shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : (
          /* Audio Call avatar with animated rings */
          <div className="relative flex items-center justify-center">
            <div className="absolute w-36 h-36 rounded-full bg-purple-500/10 border border-purple-500/20 animate-ping" />
            <div className="absolute w-28 h-28 rounded-full bg-purple-500/20 border border-purple-500/30 animate-pulse" />
            
            <div className="relative w-20 h-20 rounded-[28px] bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-2xl border border-white/20">
              {nameInitials}
            </div>

            {status === "active" && !isMuted && (
              <div className="absolute -bottom-16 flex items-end gap-1 h-8">
                <span className="w-1 bg-purple-400 rounded-full animate-[soundWave_1s_infinite_0.1s]" style={{ height: "40%" }} />
                <span className="w-1 bg-purple-300 rounded-full animate-[soundWave_1s_infinite_0.3s]" style={{ height: "70%" }} />
                <span className="w-1 bg-purple-400 rounded-full animate-[soundWave_1s_infinite_0.5s]" style={{ height: "100%" }} />
                <span className="w-1 bg-purple-300 rounded-full animate-[soundWave_1s_infinite_0.2s]" style={{ height: "60%" }} />
                <span className="w-1 bg-purple-400 rounded-full animate-[soundWave_1s_infinite_0.4s]" style={{ height: "30%" }} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Toolbar */}
      {status !== "incoming" && status !== "ended" && (
        <div className="flex items-center gap-6 mb-6">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 transition active:scale-95 cursor-pointer ${isMuted ? "bg-white text-neutral-950 hover:bg-neutral-200" : "bg-white/10 text-white hover:bg-white/15"
              }`}
            aria-label="Mute"
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 transition active:scale-95 cursor-pointer ${!isSpeakerOn ? "bg-white text-neutral-950 hover:bg-neutral-200" : "bg-white/10 text-white hover:bg-white/15"
              }`}
            aria-label="Speaker"
          >
            {isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          {type === "video" && (
            <button
              onClick={() => setIsCamOff(!isCamOff)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 transition active:scale-95 cursor-pointer ${isCamOff ? "bg-white text-neutral-950 hover:bg-neutral-200" : "bg-white/10 text-white hover:bg-white/15"
                }`}
              aria-label="Camera"
            >
              {isCamOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
          )}

          <button
            onClick={endCall}
            className="w-14 h-14 rounded-[20px] bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-xl active:scale-95 transition cursor-pointer border-none outline-none"
            aria-label="End call"
          >
            <PhoneOff size={24} />
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes soundWave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  );
}
