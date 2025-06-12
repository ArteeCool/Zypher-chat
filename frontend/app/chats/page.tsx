"use client";

import { FormEvent, useEffect, useState } from "react";
import chatsService from "../controllers/chats";
import { authService } from "../controllers/auth";
import SearchBar from "../components/SearchBar";
import { useRouter } from "next/navigation";
import Chat from "../components/Chat";
import { X } from "lucide-react";

interface ChatData {
  _id: string;
  participantsIds: string[];
  messages: { senderId: string; text: string; timestamp?: string }[];
  name?: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
}

const Chats = () => {
  const router = useRouter();
  const [chatList, setChatList] = useState<ChatData[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatData>();
  const [usersMap, setUsersMap] = useState<Record<string, User>>({});
  const [isCreatingGroup, setIsCreatingGroup] = useState<boolean>(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState<string>("");
  const [groupName, setGroupName] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  useEffect(() => {
    if (typeof window === "undefined") return;

    (async () => {
      const result = await authService.validateToken();
      if (!result.status) {
        localStorage.removeItem("token");
        router.push("/");
      }
    })();
  }, [router]);

  useEffect(() => {
    (async () => {
      const allChats = await chatsService.getChats();
      const userId = authService.currentUser?._id;

      const userChats = allChats.data.filter((chat: ChatData) =>
        chat.participantsIds.includes(userId)
      );
      setChatList(userChats);

      const allUserIds = userChats
        .map((chat: any) => chat.participantsIds)
        .flat()
        .filter((id: any, index: any, arr: any) => arr.indexOf(id) === index);

      const allUsers = await chatsService.getUsers();
      const map: Record<string, User> = {};
      allUsers.data.forEach((user: User) => {
        map[user._id] = user;
      });
      setUsersMap(map);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await authService.initFromLocalStorage();
      await authService.isEmailConfirmed();
    })();
  }, []);

  useEffect(() => {
    const socket = new WebSocket("wss://109.95.33.158:5678/");

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const userId = authService.currentUser?._id;
      if (!userId) return;

      const updatedChats = data.filter((chat: ChatData) =>
        chat.participantsIds.includes(userId)
      );

      setChatList(updatedChats);

      setCurrentChat((prev) => {
        if (!prev) return undefined;
        return updatedChats.find((chat: ChatData) => chat._id === prev._id);
      });
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => socket.close();
  }, []);

  useEffect(() => {
    const initUser = async () => {
      await authService.initFromLocalStorage();
      const user = authService.currentUser;
      if (user?._id) {
        setCurrentUserId(user._id);
      } else {
        console.error("No current user ID found.");
      }
    };

    initUser();
  }, []);

  const handleGroupCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;

    const newChat = await chatsService.createChat(groupName, [
      ...selectedUsers.map((user) => user._id),
      currentUserId,
    ]);

    setIsCreatingGroup(false);
    setSelectedUsers([]);
    setGroupName("");
    setUserSearchQuery("");
  };

  return (
    <div className="min-h-[89.5vh] flex items-center">
      <div className="mx-auto max-w-6xl w-full h-[80vh] bg-neutral-800 rounded-2xl flex relative">
        <div className="relative flex flex-col h-full w-64">
          <SearchBar />
          <div className="p-4 space-y-2">
            {chatList.map((chat) => {
              const otherUserIds = chat.participantsIds.filter(
                (id) => id !== currentUserId
              );

              return (
                <div
                  key={chat._id}
                  className="bg-neutral-700 rounded-lg p-3 text-white shadow-md cursor-pointer"
                  onClick={() => setCurrentChat(chat)}
                >
                  <h1>
                    {chat.participantsIds.length > 2
                      ? chat.name
                      : chat.participantsIds
                          .filter((id) => id !== currentUserId)
                          .map((id) => usersMap[id]?.username)}
                  </h1>
                </div>
              );
            })}

            <button
              className="absolute bottom-0 left-0 p-3 bg-neutral-700 m-2 rounded-full"
              onClick={() => setIsCreatingGroup(true)}
            >
              Create Group
            </button>
          </div>
        </div>

        <div className="w-full">
          {isCreatingGroup && (
            <div className="absolute left-0 right-0 top-0 bottom-0 w-full h-full bg-neutral-700 rounded-[0px_16px_16px_0px] flex items-center justify-center text-white z-10">
              <div className="max-w-md mx-auto p-6 bg-neutral-600 rounded-2xl shadow-lg space-y-4">
                <h1 className="text-2xl font-semibold">Create Group</h1>
                <form onSubmit={handleGroupCreate} className="space-y-4">
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Group name..."
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {userSearchQuery && (
                    <div className="bg-neutral-700 border rounded-md max-h-40 overflow-y-auto p-2 space-y-1">
                      {Object.values(usersMap)
                        .filter(
                          (user) =>
                            user.username
                              .toLowerCase()
                              .includes(userSearchQuery.toLowerCase()) &&
                            user._id !== currentUserId &&
                            !selectedUsers.some((u) => u._id === user._id)
                        )
                        .map((user) => (
                          <div
                            key={user._id}
                            className="cursor-pointer hover:backdrop-brightness-110 p-1 rounded"
                            onClick={() =>
                              setSelectedUsers((prev) => [...prev, user])
                            }
                          >
                            {user.username}
                          </div>
                        ))}
                    </div>
                  )}
                  {selectedUsers.length > 0 && (
                    <div className="bg-neutral-700 border rounded-md max-h-40 overflow-y-auto p-2 space-y-1">
                      {selectedUsers.map((user) => (
                        <div
                          key={user._id}
                          className="cursor-pointer hover:backdrop-brightness-110 p-1 rounded"
                          onClick={() =>
                            setSelectedUsers((prev) =>
                              prev.filter((u) => u._id !== user._id)
                            )
                          }
                        >
                          {user.username}
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    Create Group
                  </button>
                </form>
              </div>
              <button
                onClick={() => setIsCreatingGroup(false)}
                className="absolute top-3 right-3"
              >
                <X />
              </button>
            </div>
          )}
          <Chat chat={currentChat} setChat={setCurrentChat} />
        </div>
      </div>
    </div>
  );
};

export default Chats;
