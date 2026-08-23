"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { API_BASE } from "@/lib/api-config";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WebRTCCallProps {
  userId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  remoteUserName: string;
  remoteUserAvatar?: string;
  onEndCall?: () => void;
  // Masque le bouton "Appeler" quand le composant est intégré dans une page
  // qui a déjà ses propres boutons d'appel (ex: /messages).
  showStartButton?: boolean;
}

export interface WebRTCCallHandle {
  startAudioCall: () => void;
  startVideoCall: () => void;
}

export const WebRTCCall = forwardRef<WebRTCCallHandle, WebRTCCallProps>(
  function WebRTCCall(
    {
      userId,
      currentUserId,
      currentUserName,
      currentUserAvatar,
      remoteUserName,
      remoteUserAvatar,
      onEndCall,
      showStartButton = true,
    }: WebRTCCallProps,
    ref
  ) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [incomingCaller, setIncomingCaller] = useState<{
    from: string;
    fromName: string;
    fromAvatar?: string;
    isScreenShare?: boolean;
    signal?: RTCSessionDescriptionInit;
  } | null>(null);

  const isCallActiveRef = useRef(false);
  const isCallingRef = useRef(false);
  useEffect(() => {
    isCallActiveRef.current = isCallActive;
  }, [isCallActive]);
  useEffect(() => {
    isCallingRef.current = isCalling;
  }, [isCalling]);
  // Toujours appeler le hangUp le plus récent (évite les closures périmés
  // dans les handlers socket / connexion WebRTC)
  const hangUpRef = useRef<(notifyRemote?: boolean) => void>(() => {});

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const configuration: RTCConfiguration = useMemo(
    () => ({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    }),
    []
  );

  // Connect to Socket.io
  useEffect(() => {
    const newSocket = io(`${API_BASE}`, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Socket connected for WebRTC");
      newSocket.emit("join", currentUserId);
    });

    newSocket.on("incoming-call", (data) => {
      // Déjà en appel ? Signaler "occupé" à l'appelant au lieu d'empiler un 2e appel
      if (isCallActiveRef.current || isCallingRef.current) {
        newSocket.emit("call-busy", { to: data.from, from: currentUserId });
        toast.error("Appel entrant ignoré (déjà en ligne)", { duration: 2500 });
        return;
      }
      console.log("Incoming call from:", data.from);
      setIsIncomingCall(true);
      setIncomingCaller({
        from: data.from,
        fromName: data.fromName,
        fromAvatar: data.fromAvatar,
        isScreenShare: data.isScreenShare,
        signal: data.signal,
      });
    });

    newSocket.on("call-declined", () => {
      console.log("Call declined by remote");
      toast.info("Appel refusé par l'interlocuteur", { duration: 3000 });
      // Coupe aussi le flux caméra/micro et ferme la connexion locale,
      // sans renvoyer end-call (l'interlocuteur a déjà refusé)
      hangUpRef.current(false);
    });

    newSocket.on("call-busy", () => {
      console.log("Call target busy");
      toast.info("L'interlocuteur est déjà en ligne", { duration: 3000 });
      // Ne PAS renvoyer end-call : l'interlocuteur est occupé sur un autre appel
      hangUpRef.current(false);
    });

    newSocket.on("call-accepted", async (signalData) => {
      console.log("Call accepted");
      setIsCallActive(true);
      setIsCalling(false);
      if (peerConnectionRef.current && signalData) {
        try {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(signalData)
          );
        } catch (err) {
          console.error("Error setting remote description:", err);
        }
      }
    });

    newSocket.on("call-ended", () => {
      console.log("Call ended by remote");
      hangUpRef.current();
    });

    // Reconnexion socket : socket.io re-fire "connect" → on re-rejoint la salle
    // (le listener "connect" ci-dessus couvre déjà ce cas)

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected (WebRTC)");
      if (isCallActiveRef.current || isCallingRef.current) {
        hangUpRef.current();
      }
    });

    newSocket.on("ice-candidate", async (candidate) => {
      if (peerConnectionRef.current && candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    });

    setSocket(newSocket);

    return () => {
      hangUpRef.current();
      newSocket.disconnect();
    };
  }, [currentUserId]);

  const getLocalStream = useCallback(async (video = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error("Error getting local stream:", err);
      toast.error(
        "Caméra ou micro indisponible. Vérifiez les permissions du navigateur.",
        { duration: 4000 }
      );
      return null;
    }
  }, []);

  const createPeerConnection = useCallback(
    (stream: MediaStream) => {
      const pc = new RTCPeerConnection(configuration);

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("ice-candidate", {
            to: userId,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        remoteStreamRef.current = remoteStream;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          hangUpRef.current();
        }
      };

      peerConnectionRef.current = pc;
      return pc;
    },
    [socket, userId, configuration]
  );

  const startCall = useCallback(
    async (video: boolean) => {
      setIsCalling(true);
      const stream = await getLocalStream(video);
      if (!stream) {
        setIsCalling(false);
        return;
      }

      const pc = createPeerConnection(stream);

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        if (socket) {
          socket.emit("call-user", {
            to: userId,
            from: currentUserId,
            fromName: currentUserName,
            fromAvatar: currentUserAvatar,
            signalData: offer,
            isScreenShare: false,
          });
        }
      } catch (err) {
        console.error("Error creating offer:", err);
        setIsCalling(false);
      }
    },
    [
      getLocalStream,
      createPeerConnection,
      socket,
      userId,
      currentUserId,
      currentUserName,
      currentUserAvatar,
    ]
  );

  // API impérative exposée aux pages intégrant le composant : permet de
  // déclencher un appel audio ou vidéo sans bouton interne.
  useImperativeHandle(
    ref,
    () => ({
      startAudioCall: () => startCall(false),
      startVideoCall: () => startCall(true),
    }),
    [startCall]
  );

  const acceptCall = useCallback(async () => {
    if (!incomingCaller || !incomingCaller.signal) return;

    const stream = await getLocalStream(isVideoEnabled);
    if (!stream) return;

    const pc = createPeerConnection(stream);

    try {
      await pc.setRemoteDescription(
        new RTCSessionDescription(incomingCaller.signal)
      );
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (socket) {
        socket.emit("accept-call", {
          to: incomingCaller.from,
          signalData: answer,
        });
      }

      setIsIncomingCall(false);
      setIsCallActive(true);
    } catch (err) {
      console.error("Error accepting call:", err);
    }
  }, [getLocalStream, isVideoEnabled, createPeerConnection, socket, incomingCaller]);

  // Refus explicite d'un appel entrant : notifie l'appelant (call-declined)
  // puis nettoie localement SANS renvoyer end-call (isCalling/isCallActive
  // sont faux côté destinataire, donc hangUp() seul laisserait l'appelant
  // bloqué sur "Appel en cours...")
  const declineIncomingCall = useCallback(() => {
    // Nettoyage local TOUJOURS effectué, même si le socket/incomingCaller
    // manquent (ex. reconnexion en cours)
    if (incomingCaller && socket) {
      socket.emit("call-declined", {
        to: incomingCaller.from,
        from: currentUserId,
      });
    }
    hangUpRef.current(false);
  }, [incomingCaller, socket, currentUserId]);

  const hangUp = useCallback((notifyRemote = true) => {
    // Notifier l'interlocuteur si l'appel est actif OU encore en sonnerie
    // (sinon son overlay "Appel entrant" resterait bloqué).
    // notifyRemote=false pour decline/busy : ne PAS renvoyer end-call à un
    // interlocuteur occupé (ça couperait son appel avec un tiers).
    if (notifyRemote && socket && (isCallActive || isCalling)) {
      socket.emit("end-call", { to: userId });
    }

    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Reset video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setIsCallActive(false);
    setIsCalling(false);
    setIsIncomingCall(false);
    setIsScreenSharing(false);
    setIncomingCaller(null);
    onEndCall?.();
  }, [socket, isCallActive, isCalling, userId, onEndCall]);

  // Maintenir hangUpRef à jour à chaque rendu
  useEffect(() => {
    hangUpRef.current = hangUp;
  }, [hangUp]);

  const toggleVideo = useCallback(async () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen share and revert to camera
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }

      const stream = await getLocalStream(true);
      if (stream && peerConnectionRef.current) {
        const sender = peerConnectionRef.current
          .getSenders()
          .find((s) => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(stream.getVideoTracks()[0]);
        }
      }

      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        screenStreamRef.current = screenStream;

        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current
            .getSenders()
            .find((s) => s.track?.kind === "video");
          if (sender) {
            sender.replaceTrack(screenStream.getVideoTracks()[0]);
          }
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error("Error sharing screen:", err);
      }
    }
  }, [isScreenSharing, getLocalStream]);

  if (!isCallActive && !isCalling && !isIncomingCall) {
    // Bouton "Appeler" masqué quand la page hôte fournit ses propres boutons
    if (!showStartButton) {
      return null;
    }
    return (
      <Button
        onClick={() => startCall(isVideoEnabled)}
        disabled={isCalling}
        className="gap-2 bg-green-600 hover:bg-green-700"
      >
        {isCalling ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Phone className="h-4 w-4" />
        )}
        Appeler
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300",
        isMinimized ? "w-72 h-20" : "w-80 sm:w-96"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              isCallActive ? "bg-green-500 animate-pulse" : "bg-yellow-500"
            )}
          />
          <span className="text-white text-sm font-medium">
            {isCalling
              ? "Appel en cours..."
              : isCallActive
              ? `${remoteUserName}`
              : "Appel entrant"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() =>
              isIncomingCall ? declineIncomingCall() : hangUp()
            }
            className="p-1 hover:bg-red-600 rounded text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Video area */}
          <div className="relative bg-black" style={{ aspectRatio: "4/3" }}>
            {/* Remote video (main) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Local video (picture-in-picture) */}
            <div className="absolute bottom-3 right-3 w-24 h-18 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>

            {/* Incoming call overlay */}
            {isIncomingCall && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                <p className="text-white text-lg font-semibold mb-4">
                  {incomingCaller?.fromName} vous appelle
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={acceptCall}
                    className="bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Accepter
                  </Button>
                  <Button
                    onClick={declineIncomingCall}
                    variant="destructive"
                    className="gap-2"
                  >
                    <PhoneOff className="h-4 w-4" />
                    Refuser
                  </Button>
                </div>
              </div>
            )}

            {/* Calling overlay */}
            {isCalling && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                <Loader2 className="h-12 w-12 animate-spin text-white mb-4" />
                <p className="text-white text-lg font-semibold">
                  Appel de {remoteUserName}...
                </p>
                <Button
                  onClick={() => hangUp()}
                  variant="destructive"
                  className="mt-6 gap-2"
                >
                  <PhoneOff className="h-4 w-4" />
                  Annuler
                </Button>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 p-4 bg-gray-800">
            <button
              onClick={toggleAudio}
              className={cn(
                "p-3 rounded-full transition-all",
                isAudioEnabled
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-red-600 text-white"
              )}
              title={isAudioEnabled ? "Couper le micro" : "Activer le micro"}
            >
              {isAudioEnabled ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={toggleVideo}
              className={cn(
                "p-3 rounded-full transition-all",
                isVideoEnabled
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-red-600 text-white"
              )}
              title={isVideoEnabled ? "Désactiver la caméra" : "Activer la caméra"}
            >
              {isVideoEnabled ? (
                <Video className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={toggleScreenShare}
              className={cn(
                "p-3 rounded-full transition-all",
                isScreenSharing
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              )}
              title={
                isScreenSharing
                  ? "Arrêter le partage d'écran"
                  : "Partager l'écran"
              }
            >
              {isScreenSharing ? (
                <MonitorOff className="h-5 w-5" />
              ) : (
                <Monitor className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={() => hangUp()}
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all"
              title="Raccrocher"
            >
              <PhoneOff className="h-5 w-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
  }
);
