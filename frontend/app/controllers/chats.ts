import { off } from "process";
import { authService } from "./auth";

class ChatsService {
  private baseUrl = "https://109.95.33.158:5678/api/";

  constructor() {}

  async getChats() {
    const token = localStorage.getItem("token");

    const res = await fetch(this.baseUrl + "chat", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return data;
  }

  async getUsers() {
    const token = await localStorage.getItem("token");
    const res = await fetch(this.baseUrl + "chat/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    return data;
  }

  async checkChatExists(participantsIds: string[]) {
    const res = await this.getChats();

    if (participantsIds.length > 2) return false;

    return res.data.find((chat: any) => {
      const existing = [...chat.participantsIds].sort().join(",");
      const incoming = [...participantsIds].sort().join(",");
      return existing === incoming;
    });
  }

  private isChatCreating = false;

  async createChat(name: string, participantsIds: string[]) {
    if (this.isChatCreating) return;
    this.isChatCreating = true;

    try {
      const chatExists = await this.checkChatExists(participantsIds);
      if (chatExists) return chatExists;

      const res = await fetch(this.baseUrl + "chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, participantsIds }),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Chat creation failed:", error);
    } finally {
      this.isChatCreating = false;
    }
  }

  async getUserById(id: string) {
    const users = await this.getUsers();
    return users.data.find((user: any) => user._id === id);
  }

  async sendMessage(chatId: string, text: string) {
    const userId = authService.currentUser._id;

    if (!text || !userId) {
      throw new Error("Sender ID and text must be provided.");
    }

    const res = await fetch(this.baseUrl + "chat", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: chatId, senderId: userId, text }),
    });

    return res;
  }

  async uploadFile(fileToUpload: File) {
    const formData = new FormData();
    formData.append("image", fileToUpload);

    const res = await fetch("https://arteecool.com.ua/upload", {
      method: "POST",
      body: formData,
    });

    return res.json();
  }

  async deleteChat(chatId: string) {
    const res = await fetch(this.baseUrl + "chat", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: chatId }),
    });
    return res;
  }
}

const chatsService = new ChatsService();

export default chatsService;
