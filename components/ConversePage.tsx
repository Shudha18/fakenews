import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAIBlob } from "@google/genai";

type ConversationState = 'idle' | 'connecting' | 'active' | 'speaking' | 'stopped' | 'error';
type TranscriptItem = {
    speaker: 'You' | 'Model';
    text: string;
};

// --- Audio Encoding/Decoding Helpers ---
// These must be implemented manually as per Gemini API guidelines.
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const ConversePage: React.FC = () => {
    const [conversationState, setConversationState] = useState<ConversationState>('idle');
    const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef<number>(0);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    // --- Cleanup logic ---
    const cleanup = () => {
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();
        outputSourcesRef.current.forEach(source => source.stop());

        mediaStreamRef.current = null;
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;
        scriptProcessorRef.current = null;
        outputSourcesRef.current.clear();
        nextStartTimeRef.current = 0;
    };

    useEffect(() => {
        // This effect ensures cleanup happens on component unmount
        return () => {
            if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then(session => session.close());
            }
            cleanup();
        };
    }, []);
    
    useEffect(() => {
      // Auto-scroll to the latest message
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);


    const handleStartConversation = async () => {
        if (conversationState !== 'idle' && conversationState !== 'stopped' && conversationState !== 'error') return;

        setConversationState('connecting');
        setError(null);
        setTranscript([]);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // --- Initialize Audio Contexts ---
            inputAudioContextRef.current = new (window.AudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext)({ sampleRate: 24000 });
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setConversationState('active');
                        // Set up microphone input streaming
                        const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: GenAIBlob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(f => f * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            
                            // CRITICAL: Use promise to ensure session is active before sending data
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        
                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle transcription
                        let currentInput = "";
                        let currentOutput = "";
                        if (message.serverContent?.inputTranscription) {
                            currentInput += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutput += message.serverContent.outputTranscription.text;
                        }

                        setTranscript(prev => {
                            const newTranscript = [...prev];
                            if (currentInput) {
                                if (newTranscript.length > 0 && newTranscript[newTranscript.length - 1].speaker === 'You') {
                                    newTranscript[newTranscript.length - 1].text += currentInput;
                                } else {
                                    newTranscript.push({ speaker: 'You', text: currentInput });
                                }
                            }
                            if (currentOutput) {
                                setConversationState('speaking');
                                if (newTranscript.length > 0 && newTranscript[newTranscript.length - 1].speaker === 'Model') {
                                    newTranscript[newTranscript.length - 1].text += currentOutput;
                                } else {
                                    newTranscript.push({ speaker: 'Model', text: currentOutput });
                                }
                            }
                            return newTranscript;
                        });

                        if(message.serverContent?.turnComplete) {
                            setConversationState('active');
                        }

                        // Handle audio playback
                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (audioData) {
                            const outputCtx = outputAudioContextRef.current!;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                            
                            const audioBuffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            
                            source.addEventListener('ended', () => {
                                outputSourcesRef.current.delete(source);
                            });

                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            outputSourcesRef.current.add(source);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        setError(`An error occurred: ${e.message}`);
                        setConversationState('error');
                        cleanup();
                    },
                    onclose: () => {
                        setConversationState('stopped');
                        cleanup();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                    },
                },
            });

        } catch (err: any) {
            console.error(err);
            if(err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'){
                 setError("Microphone permission denied. Please allow microphone access in your browser settings to use this feature.");
            } else {
                 setError("Failed to start the conversation. Please check your connection and try again.");
            }
            setConversationState('error');
            cleanup();
        }
    };

    const handleStopConversation = () => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
            // onclose callback will handle state update and cleanup
        }
    };

    const getStatusInfo = () => {
        switch (conversationState) {
            case 'idle': return { text: 'Ready to start', color: 'text-light-text-secondary dark:text-cyber-text-secondary' };
            case 'connecting': return { text: 'Connecting...', color: 'text-light-yellow dark:text-cyber-yellow' };
            case 'active': return { text: 'Listening...', color: 'text-light-green dark:text-cyber-green' };
            case 'speaking': return { text: 'Speaking...', color: 'text-light-cyan dark:text-cyber-cyan' };
            case 'stopped': return { text: 'Conversation ended', color: 'text-light-text-secondary dark:text-cyber-text-secondary' };
            case 'error': return { text: 'Error', color: 'text-light-red dark:text-cyber-red' };
            default: return { text: '', color: '' };
        }
    };

    const statusInfo = getStatusInfo();
    const isSessionActive = ['connecting', 'active', 'speaking'].includes(conversationState);

    return (
        <div className="w-full animate-fade-in-up">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-light-cyan dark:text-cyber-cyan">Live Conversation</h2>
                <p className="mt-2 text-light-text-secondary dark:text-cyber-text-secondary">
                    Speak directly with the AI. Press 'Start Conversation' and begin talking.
                </p>
            </div>

            <div className="mt-8 flex flex-col items-center gap-6">
                <div className={`relative flex items-center justify-center w-24 h-24 rounded-full border-2 ${isSessionActive ? 'border-light-cyan dark:border-cyber-cyan' : 'border-light-border dark:border-cyber-border'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-10 h-10 transition-colors ${isSessionActive ? 'text-light-cyan dark:text-cyber-cyan' : 'text-light-text-secondary dark:text-cyber-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18.75a6 6 0 0 0 6-6v-1.5a6 6 0 0 0-12 0v1.5a6 6 0 0 0 6 6Z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 12.75a3 3 0 0 0 3-3v-1.5a3 3 0 0 0-6 0v1.5a3 3 0 0 0 3 3Z" />
                    </svg>
                    {isSessionActive && <div className="absolute inset-0 rounded-full border-2 border-light-cyan dark:border-cyber-cyan animate-pulse-microphone" />}
                </div>

                <p className={`font-bold tracking-wider ${statusInfo.color}`}>{statusInfo.text}</p>
                
                {!isSessionActive ? (
                    <button onClick={handleStartConversation} className="px-8 py-3 font-bold text-white dark:text-cyber-bg bg-light-cyan dark:bg-cyber-cyan rounded-md transition-all duration-300 dark:shadow-cyber-glow-cyan hover:scale-105">
                        Start Conversation
                    </button>
                ) : (
                    <button onClick={handleStopConversation} className="px-8 py-3 font-bold text-white bg-light-red dark:bg-cyber-red rounded-md transition-all duration-300 hover:scale-105">
                        Stop Conversation
                    </button>
                )}
                 {error && <p className="text-center text-sm text-light-red dark:text-cyber-red mt-2 max-w-md">{error}</p>}
            </div>

            <div className="mt-8 w-full max-w-2xl mx-auto h-96 bg-light-surface dark:bg-cyber-surface border border-light-border dark:border-cyber-border rounded-lg p-4 overflow-y-auto flex flex-col gap-4">
                {transcript.length === 0 && (
                    <div className="m-auto text-center text-light-text-secondary dark:text-cyber-text-secondary">
                        <p>Transcript will appear here...</p>
                    </div>
                )}
                {transcript.map((item, index) => (
                    <div key={index} className={`flex flex-col ${item.speaker === 'You' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${item.speaker === 'You' ? 'bg-light-cyan/10 dark:bg-cyber-cyan/10' : 'bg-light-bg dark:bg-cyber-bg-dark'}`}>
                           <p className={`font-bold text-sm mb-1 ${item.speaker === 'You' ? 'text-light-cyan dark:text-cyber-cyan' : 'text-light-text dark:text-cyber-text'}`}>{item.speaker}</p>
                           <p className="text-light-text dark:text-cyber-text">{item.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={transcriptEndRef} />
            </div>
        </div>
    );
};

export default ConversePage;