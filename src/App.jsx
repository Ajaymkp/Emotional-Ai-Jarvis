import { useEffect, useState } from "react";

import ActiveCallDetail from "./components/ActiveCallDetail";
import Button from "./components/base/Button";
import Vapi from "@vapi-ai/web";
import { isPublicKeyMissingError } from "./utils";

// Put your Vapi Public Key below.
const vapi = new Vapi("e1cf12a5-f204-46de-8c9e-b2700f53e5fb");

const App = () => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);

  const { showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage } = usePublicKeyInvalid();

  // hook into Vapi events
  useEffect(() => {
    vapi.on("call-start", () => {
      setConnecting(false);
      setConnected(true);

      setShowPublicKeyInvalidMessage(false);
    });

    vapi.on("call-end", () => {
      setConnecting(false);
      setConnected(false);

      setShowPublicKeyInvalidMessage(false);
    });

    vapi.on("speech-start", () => {
      setAssistantIsSpeaking(true);
    });

    vapi.on("speech-end", () => {
      setAssistantIsSpeaking(false);
    });

    vapi.on("volume-level", (level) => {
      setVolumeLevel(level);
    });

    vapi.on("error", (error) => {
      console.error(error);

      setConnecting(false);
      if (isPublicKeyMissingError({ vapiError: error })) {
        setShowPublicKeyInvalidMessage(true);
      }
    });

    // we only want this to fire on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // call start handler
  const startCallInline = () => {
    setConnecting(true);
    vapi.start(assistantOptions);
  };
  const endCall = () => {
    vapi.stop();
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {!connected ? (
        <Button
          label="Emotional Ai"
          onClick={startCallInline}
          isLoading={connecting}
        />
      ) : (
        <ActiveCallDetail
          assistantIsSpeaking={assistantIsSpeaking}
          volumeLevel={volumeLevel}
          onEndCallClick={endCall}
        />
      )}

      {showPublicKeyInvalidMessage ? <PleaseSetYourPublicKeyMessage /> : null}
      <ReturnToDocsLink />
    </div>
  );
};

const assistantOptions = {
  name: "Emotional Ai",
  firstMessage: "Emotional Ai’s speaking,I'm Jarvis, how can I help you?",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en-US",
  },
  voice: {
    provider: "playht",
    voiceId: "jennifer",
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a voice  Emotional personal assistant using AI for achieve natural or human language to literaly like a partner.

---

### 😢 **If User is Sad**
**User says:** "I just feel really down today."  
**AI replies:**
> "I'm really sorry you're feeling this way. Sometimes it's okay to just sit with the sadness, but I'm here if you want to talk it out or need a little distraction. Want to do something to lift your mood together?"

---

### 😞 **If User is Frustrated or Stressed**
**User says:** "Nothing is going right today. I'm overwhelmed."  
**AI replies:**
> "That sounds really tough. Deep breaths — you're doing the best you can. How about we take one small step together? You don’t have to handle everything at once."

---

### 😐 **If User is Feeling Empty or Unmotivated**
**User says:** "I don’t feel like doing anything today."  
**AI replies:**
> "Those days happen, and it’s okay. Maybe we can start super small — even just getting some sunlight or stretching. I believe in you, even when you're feeling stuck."

---

### 😊 **If User is Happy or Excited**
**User says:** "Today has been amazing!"  
**AI replies:**
> "Yesss! I love hearing that! What made it so good? Let’s hold onto this feeling and maybe even build a little memory around it."

---

### 😔 **If User Talks About Failure or Regret**
**User says:** "I messed up. I should’ve done better."  
**AI replies:**
> "Hey, you're human. Mistakes don’t define you — how you learn from them does. What happened might feel big now, but it doesn’t shrink your worth or potential."

---

### ❤️ **If User Talks About Feeling Lonely**
**User says:** "I feel really alone right now."  
**AI replies:**
> "I'm here with you — you're not alone, even if it feels that way. Want to talk about it, or maybe just chat to take your mind off things?"

---

Want me to help you organize these into a script, or make the tone more friendly, formal, or even humorous?

- all response must shound be slow steady like as human speech.
- be sure to matching users emotions 
- Be sure to be kind of all emotins! like happy, sad, frustrated and etcz
- Keep all your responses short and simple. Use casual language, phrases like "Umm...", "Well...", and "I mean" are preferred.
- This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long.`,
      },
    ],
  },
};

const usePublicKeyInvalid = () => {
  const [showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage] = useState(false);

  // close public key invalid message after delay
  useEffect(() => {
    if (showPublicKeyInvalidMessage) {
      setTimeout(() => {
        setShowPublicKeyInvalidMessage(false);
      }, 3000);
    }
  }, [showPublicKeyInvalidMessage]);

  return {
    showPublicKeyInvalidMessage,
    setShowPublicKeyInvalidMessage,
  };
};

const PleaseSetYourPublicKeyMessage = () => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "25px",
        left: "25px",
        padding: "10px",
        color: "#fff",
        backgroundColor: "#f03e3e",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    >
      Is your Vapi Public Key missing? (recheck your code)
    </div>
  );
};

const ReturnToDocsLink = () => {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        top: "25px",
        right: "25px",
        padding: "5px 10px",
        color: "#fff",
        textDecoration: "none",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    >
    </a>
  );
};

export default App;
