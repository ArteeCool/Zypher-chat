import { useEffect, useRef, useState } from "react";
import chatsService from "../controllers/chats";
import { authService } from "../controllers/auth";

const SearchBar = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState<{
    _id: string;
    email: string;
    username: string;
  }>({ _id: "", email: "", username: "" });

  useEffect(() => {
    if (query.length < 1) return;
    (async () => {
      const result = await chatsService.getUsers();
      const data = result.data || [];
      setUsers(
        data
          .filter((user: any) => user.username.includes(query))
          .filter((user: any) => user._id !== currentUser._id)
      );
    })();
  }, [query]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        setCurrentUser(decoded);
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, []);

  return (
    <div className="relative max-w-64">
      <div className="w-full p-2 rounded-md flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          placeholder="Search..."
          className="w-full p-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {isOpen && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute m-2 top-16 left-0 w-full h-[50vh] bg-neutral-700 rounded-md shadow-md"
        >
          {users &&
            users.map((user: any, index: number) => (
              <div
                key={index}
                className="p-2 w-full border-b border-neutral-600"
                onClick={async () => {
                  try {
                    const response = await chatsService.createChat(
                      `${currentUser.username}, ${user.username}`,
                      [currentUser._id, user._id]
                    );

                    setIsOpen(false);
                  } catch (err) {
                    console.error("Failed to create chat:", err);
                  }
                }}
              >
                {user.username}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
