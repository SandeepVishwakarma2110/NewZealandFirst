import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import TopNavbar from "../components/TopNavbar";
import { Moon, Sun } from "lucide-react";
 


const roleInfo = {
  0: {
    title: "Level 0",
    description:
      "Level 0 users can manage users, approve/reject registrations, promote/demote roles, and access all admin features.",
    actions: [
      { label: "Approve/Reject Registrations", to: "/admin" },
      { label: "Promote/Demote Users", to: "/admin" },
      { label: "Manage Topics/Documents", to: "/main" },
      { label: "Access Admin Dashboard", to: "/admin" },
      { label: "Access Topics", to: "/view-topics" },
    ],
  },

  1: {
    title: "Level 1",
    description:
      "You can manage topics and documents and Manage Comments.",
    actions: [
      { label: "Access Topics", to: "/view-topics" },
      { label: "Manage Topics/Documents", to: "/main" },
      { label: "Manage Comments", to: "/view-topics" },
    ],
  },

  2: {
    title: "Level 2",
    description:
      "You can view key messages, search topics, and access background information.",
    actions: [
      { label: "View Background/Notes", to: "/view-topics" },
      { label: "View Calendar Events", to: "/calendar" },
    ],
  },
};


export default function Welcome() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(false); // LOCAL toggle (Navbar stays light)

  const [search, setSearch] = React.useState("");
  const [topics, setTopics] = React.useState([]);
  const [suggestions, setSuggestions] = React.useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const info = roleInfo[user.role] || roleInfo[2];

  const [topicCount, setTopicCount] = React.useState(0);
  const [userCount, setUserCount] = React.useState(0);
  const [contributions, setContributions] = React.useState({
    topics: 0,
    comments: 0,
    total: 0,
  });

  // Fetch page/stats/topics
  useEffect(() => {
    fetch("/api/topics", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => setTopics(data.topics || []));

    fetch("/api/stats/topics-count")
      .then(res => res.json())
      .then(data => setTopicCount(data.count || 0));

    fetch("/api/stats/users-count")
      .then(res => res.json())
      .then(data => setUserCount(data.count || 0));

    if (user._id) {
      fetch(`/api/stats/user-contributions/${user._id}`)
        .then(res => res.json())
        .then(data => setContributions(data));
    }
  }, [user._id]);

  // Search suggestion logic
  useEffect(() => {
    if (search.trim()) {
      setSuggestions(
        topics.filter((t) =>
          t.title.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setSuggestions([]);
    }
  }, [search, topics]);

  return (
    <>
      {/* NAVBAR ALWAYS LIGHT */}
      <TopNavbar />

      {/* MAIN PAGE */}
      <div
        className={`min-h-screen transition-all duration-300 pb-20 ${
          darkMode ? "bg-[#111315] text-white" : "bg-white text-gray-900"
        }`}
      >

        {/* RIGHT SIDE TOGGLE BUTTON */}
        <div className="max-w-6xl mx-auto px-4 pt-4 flex justify-end">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border 
                       hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>

        {/* TITLE AREA */}
        <div className="text-center mt-10">
          <h1 className="text-3xl font-bold">
            Welcome back, {user.name || "User"}!
          </h1>
          <p className="mt-2 text-gray-400">
            Ready to level up your knowledge today?
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="mt-8 flex justify-center">
          <div
            className={`w-[60%] px-4 py-3 rounded-full flex items-center shadow 
            ${darkMode ? "bg-[#1b1d1f] text-gray-300" : "bg-gray-100 text-gray-600"}`}
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="What would you like to learn about today?"
              className={`w-full bg-transparent outline-none`}
            />
          </div>
        </div>

        {/* SUGGESTION BOX */}
        {search.trim() && (
          <div
            className={`max-w-[60%] mx-auto rounded mt-2 py-2 border shadow z-40 relative 
            ${darkMode ? "bg-[#1b1d1f] text-white border-gray-700" : "bg-white text-black"}`}
          >
            {suggestions.length > 0 ? (
              suggestions.map((topic) => (
                <div
                  key={topic._id}
                  onClick={() => navigate(`/view-topics?topic=${topic._id}`)}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-600 hover:text-white rounded"
                >
                  {topic.title}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-400">No topics available</div>
            )}
          </div>
        )}

        {/* QUICK ACTIONS */}
     {/* QUICK ACTIONS */}
<h2 className="mt-10 max-w-6xl mx-auto px-4 text-lg font-semibold flex items-center gap-2">
  <span className="text-red-500 text-xl">⚡</span> Quick Actions
</h2>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 mt-4">
  {info.actions.map((item, idx) => (
    <Link
      to={item.to}
      key={idx}
      className={`p-6 rounded-xl border shadow transition block cursor-pointer
        ${darkMode ? "bg-[#1b1d1f] border-gray-700 text-gray-300" : "bg-white text-gray-800"}
        hover:scale-[1.02]`}
    >
      <div className="text-3xl mb-2">
        {item.label.includes("User") ? "👤" :
         item.label.includes("Topics") ? "📄" :
         item.label.includes("Comments") ? "💬" :
         item.label.includes("Approve") ? "🛠" :
         item.label.includes("Calendar") ? "📅" :
         item.label.includes("Background") ? "📘" :
         "➡️"}
      </div>

      <h3 className="text-xl font-semibold">{item.label}</h3>

      <p className="text-gray-400 mt-1">
        {item.label.includes("Approve") && "Review pending registrations"}
        {item.label.includes("Access Topics") && "Browse and search all topics"}
        {item.label.includes("Promote") && "Change user roles"}
        {item.label.includes("Manage Topics") && "Add or update documents"}
        {item.label.includes("Manage Comments") && "Moderate topic comments"}
        {item.label.includes("Background") && "Access field information"}
        {item.label.includes("Calendar") && "View upcoming events"}
      </p>
    </Link>
  ))}
</div>



        {/* FOOTER STATS */}
        <div
          className={`mt-10 py-4   text-sm border-t 
          ${darkMode ? "bg-[#0e0f10] border-gray-800 text-gray-300" : "bg-gray-50"}`}
        >
          <div className="max-w-6xl mx-auto flex justify-between px-4">
            <span>📄 Documents: {topicCount}</span>
            <span>👥 Active Users: {userCount}</span>
            <span>💬 Comments Today: {contributions.comments}</span>
            <span>🔗 Your Contributions: {contributions.total}</span>
          </div>
        </div>
      </div>
    </>
  );
}
