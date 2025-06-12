import React, { FormEvent, useEffect, useRef, useState } from "react";
import { authService } from "../controllers/auth";
import chatsService from "../controllers/chats";
import YourMessage from "./YourMessage";
import OpponentMessage from "./OpponentMessage";
import SystemMessage from "./SystemMessage";
import { Trash2 } from "lucide-react";
import DOMPurify from "dompurify";

const Chat = ({
  chat,
  setChat,
}: {
  chat: any;
  setChat: (chat: any) => void;
}) => {
  const [user, setUser] = useState<string | string[]>();
  const [message, setMessage] = useState<string>("");
  const [resolvedMessages, setResolvedMessages] = useState<any[]>([]);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isUserAtBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return false;
    const threshold = 100;
    const position = container.scrollTop + container.clientHeight;
    const height = container.scrollHeight;
    return height - position < threshold;
  };

  useEffect(() => {
    if (!chat) return;

    const resolveMessages = async () => {
      const resolved = await Promise.all(
        chat.messages.map(async (msg: any) => {
          if (
            msg.senderId !== "app" &&
            msg.senderId !== authService.currentUser._id
          ) {
            const user = await chatsService.getUserById(msg.senderId);
            return { ...msg, senderName: user.username };
          }
          return msg;
        })
      );

      setResolvedMessages(resolved);
    };

    resolveMessages();
  }, [chat]);

  useEffect(() => {
    (async () => {
      if (!chat) return;

      if (chat.participantsIds.length > 2) {
        setUser(chat.name);
      } else {
        const opponentId =
          chat.participantsIds[0] === authService.currentUser._id
            ? chat.participantsIds[1]
            : chat.participantsIds[0];

        const name = await chatsService.getUserById(opponentId);
        setUser(name.username);
      }
    })();
  }, [chat]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!message) return;

    const tempMessage = {
      _id: Date.now().toString(),
      senderId: authService.currentUser._id,
      text: message,
      pending: true,
      timestamp: new Date().toISOString(),
    };

    setChat({
      ...chat,
      messages: [...chat.messages, tempMessage],
    });

    setResolvedMessages((prev) => [...prev, tempMessage]);

    setMessage("");

    try {
      await chatsService.sendMessage(chat._id, message);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  useEffect(() => {
    if (isUserAtBottom()) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    }
  }, [resolvedMessages]);

  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, 0);
  }, [chat?._id]);

  useEffect(() => {
    if (!fileToUpload) return;

    (async () => {
      const tempMessage = {
        _id: Date.now().toString(),
        senderId: authService.currentUser._id,
        text: "Uploading file...",
        pending: true,
        timestamp: new Date().toISOString(),
      };

      setChat({
        ...chat,
        messages: [...chat.messages, tempMessage],
      });

      setResolvedMessages((prev) => [...prev, tempMessage]);

      try {
        const result = await chatsService.uploadFile(fileToUpload);
        const url = result.imageUrl;
        const isVideo = /\.(mp4|webm|ogg)$/i.test(url);

        const mediaHtml = isVideo
          ? `<div class="w-full max-w-md"><video controls class="w-full rounded-lg"><source src="${url}" type="video/mp4">Your browser does not support the video tag.</video></div>`
          : `<img src="${url}" class="max-w-40 max-h-80" alt="uploaded" />`;

        await chatsService.sendMessage(chat._id, mediaHtml);
        setFileToUpload(null);
      } catch (error) {
        console.error("Failed to upload file", error);
      }
    })();
  }, [fileToUpload]);

  return (
    <div className="flex flex-col p-4 w-full h-full brightness-125">
      {!chat ? (
        <div className="flex items-center justify-center flex-1 w-full">
          <div>Open chat to start a conversation</div>
        </div>
      ) : (
        <div className="flex flex-col w-full h-full flex-1">
          <div className="flex justify-between">
            <div className="text-xl font-bold mb-4">{user}</div>
            <div className="text-xl font-bold mb-4">
              <Trash2 onClick={() => chatsService.deleteChat(chat._id)} />
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto w-full flex flex-col gap-2"
            ref={messagesContainerRef}
          >
            {resolvedMessages.map((message: any, index: number) => {
              const isOwnMessage =
                authService.currentUser._id === message.senderId;
              const isSystemMessage = message.senderId === "app";
              const isMediaMessage = /<(img|video)/.test(message.text);

              const content = isMediaMessage ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(message.text, {
                      ALLOWED_TAGS: ["img", "video", "source", "div"],
                      ALLOWED_ATTR: ["src", "alt", "class", "controls", "type"],
                    }),
                  }}
                />
              ) : (
                <p>{message.text}</p>
              );

              if (isOwnMessage) {
                return (
                  <YourMessage
                    timestamp={new Date(message.timestamp)}
                    key={index}
                    pending={message.pending}
                  >
                    {content}
                  </YourMessage>
                );
              } else if (isSystemMessage) {
                return <SystemMessage key={index}>{content}</SystemMessage>;
              } else {
                return (
                  <OpponentMessage
                    timestamp={new Date(message.timestamp)}
                    key={index}
                  >
                    <h1 className="text-emerald-200 text-xs">
                      {message.senderName}
                    </h1>
                    {content}
                  </OpponentMessage>
                );
              }
            })}

            <div ref={messagesEndRef} />
          </div>

          <div className="mt-4 w-full">
            <form onSubmit={handleSubmit} className="flex gap-1">
              <input
                type="text"
                placeholder="Type your message..."
                className="w-full p-2 border rounded-md"
                onChange={(e) => setMessage(e.target.value)}
                value={message}
              />
              <button
                type="submit"
                className="ml-2 p-2 bg-blue-500 text-white rounded-md"
              >
                Send
              </button>
              <div className="relative inline-block">
                <input
                  type="file"
                  name="image"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setFileToUpload(e.target.files[0]);
                    }
                  }}
                />
                <label
                  htmlFor="file-upload"
                  className="flex text-sm items-center gap-2 py-1 px-6 bg-cyan-600 text-white font-semibold rounded-lg cursor-pointer hover:bg-cyan-700 transform transition-all duration-200"
                >
                  Choose an image
                  <span className="text-lg">📷</span>
                </label>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
