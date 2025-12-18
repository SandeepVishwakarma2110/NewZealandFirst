import React, { useState, useEffect, useRef } from "react";
import TopNavbar from "../components/TopNavbar";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { timeAgo } from "../utils/timeAgo";
import { useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

export default function ViewTopics() {
  const location = useLocation();
  const [topics, setTopics] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedMeta, setSelectedMeta] = useState(null);

  const [search, setSearch] = useState("");
  const [sideOpen, setSideOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(true);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const [replyInput, setReplyInput] = useState({});
  const [darkMode, setDarkMode] = useState(false);

  const pdfRef = useRef(null);

  // Print handler: print key messages, background, notes
  const handlePrint = async () => {
    if (!selected) return;
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(18);
    doc.text(selected.title || "Topic", 10, y);
    y += 10;
    doc.setFontSize(14);
    doc.text("Key Messages:", 10, y);
    y += 8;
    doc.setFontSize(12);
    const keyLines = doc.splitTextToSize(selected.key || "", 180);
    doc.text(keyLines, 10, y);
    y += keyLines.length * 7 + 5;
    doc.setFontSize(14);
    doc.text("Background:", 10, y);
    y += 8;
    doc.setFontSize(12);
    const bgLines = doc.splitTextToSize(selected.background || "", 180);
    doc.text(bgLines, 10, y);
    y += bgLines.length * 7 + 5;
    doc.setFontSize(14);
    doc.text("Notes:", 10, y);
    y += 8;
    doc.setFontSize(12);
    if (selected.notes) {
      doc.text((selected.notes + '').toString(), 10, y);
    } else {
      doc.text("No notes uploaded.", 10, y);
    }
    doc.save((selected.title || "topic") + "-details.pdf");
  };

  const token = localStorage.getItem("token");
  const userRaw = JSON.parse(localStorage.getItem("user") || "{}");

  const loggedUserId =
    userRaw._id || userRaw.id || userRaw.userId || null; // VALID USER ID

  //console.log("LOGGED USER ID →", loggedUserId);

  // ---------------------------------------------------
  // FETCH TOPICS
  // ---------------------------------------------------
  const fetchTopics = async () => {
    try {
      const res = await fetch("/api/topics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTopics(data.topics || []);
      // Immediately select the most recent topic if available
      if (data.topics && data.topics.length > 0) {
        handleSelect({ ...data.topics[0], tab: 'key' });
      }
    } catch (err) {
      console.error("Fetch topics error:", err);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);


  useEffect(() => {
    // After topics are loaded, select topic from query string if present
    const params = new URLSearchParams(location.search);
    const topicId = params.get('topic');
    if (topics.length > 0) {
      if (topicId) {
        const found = topics.find(t => t._id === topicId);
        if (found) {
          setSelected({ ...found, tab: "key" });
        } else {
          setSelected({ ...topics[0], tab: "key" }); // fallback to most recent
        }
      } else {
        setSelected({ ...topics[0], tab: "key" }); // default to most recent
      }
    }
  }, [topics, location.search]);

  // ---------------------------------------------------
  // SELECT TOPIC
  // ---------------------------------------------------
  const handleSelect = async (topic) => {
    // Always default to key messages tab when selecting a topic
    setSelected({ ...topic, tab: 'key' });
    setSideOpen(false);

    try {
      const resMeta = await fetch(
        `/api/topics/${topic._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const metaData = await resMeta.json();
      setSelectedMeta(metaData.topic || null);
    } catch (err) {
      console.error("Metadata fetch failed:", err);
    }

    try {
      const resComments = await fetch(
        `/api/topics/${topic._id}/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const commentData = await resComments.json();
      setComments(commentData.comments || []);
    } catch (err) {
      console.error("Comments fetch failed:", err);
    }
  };

  // ---------------------------------------------------
  // ADD COMMENT
  // ---------------------------------------------------
  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    await fetch(
      `/api/topics/${selected._id}/comments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: commentText }),
      }
    );

    setCommentText("");
    handleSelect(selected);
  };

  // ---------------------------------------------------
  // DELETE COMMENT
  // ---------------------------------------------------
  const handleDeleteComment = async (id) => {
    await fetch(`/api/comments/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    handleSelect(selected);
  };

  // ---------------------------------------------------
  // REPLY TO COMMENT
  // ---------------------------------------------------
  const handleAddReply = async (commentId) => {
    const replyText = replyInput[commentId];

    if (!replyText || !replyText.trim()) return;

    await fetch(`/api/comments/${commentId}/replies`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: replyText }),
    });

    setReplyInput((prev) => ({ ...prev, [commentId]: "" }));

    // Refresh
    const res = await fetch(
      `/api/topics/${selected._id}/comments`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    setComments(data.comments || []);
  };




  // ---------------------------------------------------
  // Export PDF / Email / Print
  // ---------------------------------------------------
  const exportPDF = async () => {
    if (!selected) return;

    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`${selected.title}.pdf`);
  };

  const emailTopic = () => {
    if (!selected) return;
    window.location.href = `mailto:?subject=${encodeURIComponent(
      selected.title
    )}&body=${encodeURIComponent(selected.background)}`;
  };

  const printTopic = () => window.print();

  // ---------------------------------------------------
  // FILTER
  // ---------------------------------------------------
  const filteredTopics = topics.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const pageBG = darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black";
  const cardBG = darkMode ? "bg-gray-800" : "bg-white";
  const sidebarBG = darkMode ? "bg-gray-900 border-gray-700" : "bg-white";

  return (
    <div className={`${pageBG} min-h-screen pb-20`}>
      <TopNavbar />

      {/* ---------------------------------------------------
         Mobile Menu + Search Row
      --------------------------------------------------- */}
      {/* ---------------------------------------------------
   Mobile Menu + Search Row (WITH SUGGESTIONS)
--------------------------------------------------- */}
      <div className="lg:hidden px-3 py-3 relative">

        <div className="flex items-center gap-2">
          <button
            className="p-2 bg-blue-600 text-white rounded"
            onClick={() => setSideOpen(true)}
          >
            ☰
          </button>

          <input
            className={`flex-1 border rounded px-3 py-2 ${darkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white"
              }`}
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* MOBILE SEARCH SUGGESTIONS */}
        {search.trim() && (
          <div
            className={`absolute left-0 right-0 mt-1 z-50 rounded shadow border max-h-60 overflow-y-auto ${darkMode
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-black border-gray-300"
              }`}
          >
            {filteredTopics.length > 0 ? (
              filteredTopics.map((topic) => (
                <div
                  key={topic._id}
                  onClick={() => {
                    handleSelect(topic);
                    setSearch("");
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-200"
                >
                  {topic.title}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">No topics available</div>
            )}
          </div>
        )}
      </div>


      {/* ---------------------------------------------------
   Desktop Search Bar (Centered)
--------------------------------------------------- */}
      <div className="hidden lg:flex justify-center pt-4 px-6">
        <div className="relative w-[50%]">
          <input
            type="text"
            className={`w-full border rounded px-4 py-2 ${darkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white"
              }`}
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Search Suggestions Dropdown (Centered Below Input) */}
          {search.trim() && (
            <div
              className={`absolute left-1/2 transform -translate-x-1/2 mt-1 w-[60%] max-h-60 overflow-y-auto rounded shadow border z-40 ${darkMode
                  ? "bg-white text-gray-600 border-gray-700"
                  : "bg-gray-700 text-white border-gray-300"
                }`}
            >
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
                  <div
                    key={topic._id}
                    onClick={() => handleSelect(topic)}
                    className={`cursor-pointer px-4 py-2 hover:bg-blue-200 ${selected?._id === topic._id
                        ? "bg-blue-500 text-white"
                        : ""
                      }`}
                  >
                    {topic.title}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">No topics available</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex">
        {/* ---------------------------------------------------
           LEFT SIDEBAR
        --------------------------------------------------- */}
        <div
          className={`${sidebarBG} fixed lg:static inset-y-0 left-0 z-30 transition-all duration-300 ${sideOpen ? "w-72" : "w-0"
            } border-r overflow-hidden lg:w-72`}
        >
          <div className="p-4 h-full flex flex-col">
            {/* Close button for mobile */}
            <div className="lg:hidden flex justify-end mb-2">
              <button
                className="text-white text-xl"
                onClick={() => setSideOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="text-sm text-gray-500 mb-2">Pinned Topics</div>
              <ul className="space-y-1 mb-6">
                {filteredTopics.slice(0, 5).map((topic) => (
                  <li
                    key={topic._id}
                    onClick={() => handleSelect(topic)}
                    className={`cursor-pointer p-2 rounded ${selected?._id === topic._id ? "bg-blue-300 border-l-4 border-blue-500" : "hover:bg-blue-200"}`}
                  >
                    {topic.title}
                  </li>
                ))}
              </ul>
              <div className="text-sm text-gray-500 mb-2">All Topics</div>
              <ul className="space-y-1">
                {filteredTopics.map((topic) => (
                  <li
                    key={topic._id}
                    onClick={() => handleSelect(topic)}
                    className={`cursor-pointer p-2 rounded ${selected?._id === topic._id ? "bg-blue-300 border-l-4 border-blue-500" : "hover:bg-blue-200"}`}
                  >
                    {topic.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------
           MAIN CONTENT
        --------------------------------------------------- */}
        <main
          ref={pdfRef}
          className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1400px] mx-auto"
        >
          {/* BREADCRUMB */}
          {selected && (
            <div className="text-sm text-blue-400 mb-2">
              Home / Topics / <span className="text-blue-600">{selected.title}</span>
            </div>
          )}

          {/* ---------------------------------------------------
             TOPIC TITLE + ACTIONS
          --------------------------------------------------- */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border 
                                        hover:bg-gray-200 dark:hover:bg-gray-700 transition self-end"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
          {selected && (
            <>
              <div className="flex flex-col lg:flex-row justify-between mb-4">
                <h1 className="text-3xl font-bold">{selected.title}</h1>

                <div className="flex gap-3 mt-4 lg:mt-0 ">
                  <button
                    onClick={exportPDF}
                    className="bg-blue-600 px-3 py-1 rounded text-white flex flex-row items-center"
                  >
                    <svg width="22" height="22" fill="currentColor">
                      <path d="M11 2l4 4h-3v6h-2V6H7l4-4zm-7 12h2v4h10v-4h2v6H4v-6z" />
                    </svg>

                    Export
                  </button>
                  <button
                    onClick={emailTopic}
                    className="bg-yellow-700 px-3 py-1 rounded text-white flex flex-row items-center"
                  >
                    <svg width="22" height="22" fill="currentColor">
                      <path d="M2 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5zm16 0H4l7 5 7-5zm0 12V8l-7 5-7-5v9h14z" />
                    </svg>

                    Email
                  </button>
                  <button
                    onClick={handlePrint}
                    className="bg-red-700 px-3 py-1 rounded text-white flex flex-row items-center"
                  >
                    <svg width="22" height="22" fill="currentColor">
                      <path d="M6 3h10v4H6V3zm-2 6h14a2 2 0 0 1 2 2v5h-4v-3H6v3H2v-5a2 2 0 0 1 2-2zm4 9h8v-4H8v4z" />
                    </svg>



                    Print
                  </button>


                </div>
              </div>

              {/* METADATA */}
              <div className={`${cardBG} p-4 rounded shadow mb-6`}>
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" fill="currentColor">
                      <path d="M10 4c4 0 7.5 2.5 9 6-1.5 3.5-5 6-9 
 6s-7.5-2.5-9-6c1.5-3.5 5-6 9-6zm0 
 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
                    </svg>
                    <span>Views: {selectedMeta?.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    🕒
                    <span>Last updated: {selectedMeta ? timeAgo(selectedMeta.updatedAt || selectedMeta.createdAt) : "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="22" height="22" fill="currentColor">
                      <path d="M11 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10c4.4 
   0 8 2.2 8 5v3H3v-3c0-2.8 3.6-5 8-5z"/>
                    </svg>
                    <span>

                      Updated by:{" "}
                      {selectedMeta?.updatedBy?.name ||
                        selectedMeta?.createdBy?.name ||
                        "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ---------------------------------------------------
                 KEY MESSAGES / BACKGROUND / NOTES TABS
              --------------------------------------------------- */}
              <div className="border-b mb-4 flex space-x-6 overflow-x-auto">
                {["key", "background", "notes"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelected((s) => ({ ...s, tab }))}
                    className={`px-4 py-2 ${selected.tab === tab
                        ? "border-b-2 border-red-600 text-red-600"
                        : ""
                      }`}
                  >
                    {tab === "key"
                      ? "Key Messages"
                      : tab === "background"
                        ? "Background"
                        : "Notes & Resources"}
                  </button>
                ))}
              </div>

              {/* TAB CONTENT */}
              <div className={`${cardBG} p-6 rounded shadow mb-6`}>
                {selected.tab === "key" && (
                  <div className="whitespace-pre-line">{selected.key}</div>
                )}

                {selected.tab === "background" && (
                  <div className="whitespace-pre-line">{selected.background}</div>
                )}

                {selected.tab === "notes" && (
                  <div>
                    {selected.notes && selected.notes.filename ? (
                     selected.notes.filename.toLowerCase().endsWith(".pdf") ? (
                        <iframe
                         src={`/api/topics/${selected._id}/notes`}
                          className="w-full h-[500px]"
                        ></iframe>
                      ) : (
                        <iframe
                         src={`https://docs.google.com/gview?url=${window.location.origin}/api/topics/${selected._id}/notes&embedded=true`}
                          className="w-full h-[500px]"
                        ></iframe>
                      )
                    ) : (
                      <p className="text-gray-400">No notes available.</p>
                    )}
                  </div>
                )}
              </div>

              {/* ---------------------------------------------------
                 COMMENTS DROPDOWN
              --------------------------------------------------- */}
              <button
                className="flex items-center gap-2 text-lg font-semibold mb-4"
                onClick={() => setCommentsOpen((c) => !c)}
              >
                {commentsOpen ? "▼" : "▶"} Comments
              </button>

              {commentsOpen && (
                <div className={`${cardBG} p-6 rounded shadow`}>
                  {/* COMMENT LIST */}
                  {comments.map((c) => (
                    <div key={c._id} className="mb-10 border-b pb-2">
                      <div className="flex justify-between">
                        <span className="font-semibold">{c.userId?.name || "User"}</span>
                        {/* DELETE BUTTON: Only for own comment and level 0/1 */}
                        {(userRaw.role === 0 || userRaw.role === 1) && c.userId?._id === loggedUserId && (
                          <button
                            onClick={() => handleDeleteComment(c._id)}
                            className="text-red-500 text-xs"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p>{c.text}</p>
                      <div className="ml-4 mt-2">
                        {c.replies?.map((r, idx) => (
                          <div key={idx} className="text-sm text-gray-700">
                            <span className="font-semibold">{r.userId?.name || "User"}:</span> {r.text}
                          </div>
                        ))}
                      </div>
                      {/* REPLY INPUT: Only for level 0/1 */}
                      {(userRaw.role === 0 || userRaw.role === 1) && (
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            value={replyInput[c._id] || ""}
                            onChange={(e) =>
                              setReplyInput((prev) => ({ ...prev, [c._id]: e.target.value }))
                            }
                            placeholder="Reply..."
                            className="border p-1 rounded w-full text-black"
                          />
                          <button
                            onClick={() => handleAddReply(c._id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          >
                            ➤
                          </button>
                        </div>
                      )}
                    </div>
                  ))}


                  {/* ADD COMMENT (OWNER ONLY) */}
                  {(userRaw.role === 0 || userRaw.role === 1) && (
                    <div className="mt-4">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full border p-2 rounded text-black"
                      />
                      <button
                        onClick={handleAddComment}
                        className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Add Comment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {!selected && (
            <p className="text-center text-gray-400 mt-10">
              Select a topic to view details.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
