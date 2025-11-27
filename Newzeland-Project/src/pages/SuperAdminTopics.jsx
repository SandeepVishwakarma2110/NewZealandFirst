import React, { useState, useEffect, useRef } from "react";
import TopNavbar from "../components/TopNavbar";
import { timeAgo } from "../utils/timeAgo";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Moon, Sun } from "lucide-react";

export default function SuperAdminTopics() {
  const [topics, setTopics] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedMeta, setSelectedMeta] = useState(null); // for metadata
  const [formTab, setFormTab] = useState("key");  // "key", "background", "notes"


  const [form, setForm] = useState({
    title: "",
    key: "",
    background: "",
    notes: null,
  });

  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");
  const [sideOpen, setSideOpen] = useState(window.innerWidth >= 1024);

  const [activeSection, setActiveSection] = useState("view"); // "add", "view", "edit"
  const [activeTab, setActiveTab] = useState("key"); // "key", "background", "notes"
  const [menuOpen, setMenuOpen] = useState(false); // mobile menu drawer

  const token = localStorage.getItem("token");
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

  // ---------------- FETCH TOPICS ----------------
  const fetchTopics = async () => {
    try {
      const res = await fetch("/api/topics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (err) {
      console.error("fetchTopics error:", err);
    }
  };

  useEffect(() => {
    const fetchAndSelect = async () => {
      await fetchTopics();
    };
    fetchAndSelect();
  }, []);

  // Auto-select most recent topic as default
  useEffect(() => {
    if (topics.length > 0 && !selected) {
      const topTopic = topics[0];
      handleSelect({ ...topTopic });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topics]);

  // Refresh topics
  const refreshTopics = async () => {
    await fetchTopics();
    setSelected(null);
    setSelectedMeta(null);
    setForm({ title: "", key: "", background: "", notes: null });
  };

  const handleSelect = async (topic) => {
    if (!topic?._id) return;
    setSelected(topic);
    setActiveSection("view");
    setActiveTab("key");
    setForm({
      title: topic.title,
      key: topic.key,
      background: topic.background,
      notes: null,
    });

    // Fetch metadata (views, updatedBy, updatedAt)
    try {
      const res = await fetch(`/api/topics/${topic._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelectedMeta(data.topic || null);
    } catch (err) {
      console.error("Metadata fetch failed:", err);
      setSelectedMeta(null);
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    await fetch(`/api/topics/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    await refreshTopics();
    setActiveSection("view");
  };

  // ---------------- EDIT ----------------
  const handleEdit = async () => {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("key", form.key);
    formData.append("background", form.background);
    if (form.notes) formData.append("notes", form.notes);

    await fetch(`/api/topics/${selected._id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    // Don’t reset everything
  await fetchTopics();

  // Find updated topic
  const updatedTopic = topics.find(t => t._id === selected._id);

  if (updatedTopic) {
    await handleSelect(updatedTopic);   // Keep selected active
  }

  setActiveSection("view");
  };

  // ---------------- ADD ----------------
  const handleAdd = async () => {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("key", form.key);
    formData.append("background", form.background);
    if (form.notes) formData.append("notes", form.notes);

    await fetch("/api/topics", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    await refreshTopics();
    setActiveSection("view");
  };

  // ---------------- SEARCH FILTER ----------------
  const filteredTopics = topics.filter((t) =>
    search.trim() === ""
      ? true
      : t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.key.toLowerCase().includes(search.toLowerCase()) ||
        t.background.toLowerCase().includes(search.toLowerCase())
  );

  // Helpers
  const exportTopicPDF = async () => {
    if (!selected) return;

    // Create a printable snapshot from pdfRef (which wraps the main content area)
    try {
      const element = pdfRef.current;
      if (!element) {
        console.error("No element to export");
        return;
      }

      // Use html2canvas to capture (scale for better resolution)
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      // Calculate dimensions
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${selected.title || "topic"}.pdf`);
    } catch (err) {
      console.error("Export PDF failed:", err);
      // fallback: try a simple window.print (user can Save as PDF)
      window.print();
    }
  };

  const emailTopic = () => {
    if (!selected) return;
    const subject = encodeURIComponent(selected.title || "Topic");
    const body = encodeURIComponent(`${selected.key || ""}\n\n${selected.background || ""}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const printTopic = () => {
    window.print();
  };

  const parseCoreMessages = (text) => {
    if (!text) return [];
    const byDouble = text.split(/\r?\n\r?\n/).map((s) => s.trim()).filter(Boolean);
    if (byDouble.length > 1) return byDouble;
    return text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  };

  // UI classes for dark mode applied where needed
  const secondNavBase = darkMode ? "bg-black text-white" : "bg-white text-black";
  const sidebarBase = darkMode ? "bg-black text-white border-r border-gray-700" : "bg-white border-r";

  return (
    <div className={darkMode ? "bg-gray-900 text-white min-h-screen pb-20" : "bg-gray-100 text-black min-h-screen pb-20"}>
      <TopNavbar />

      {/* SECOND NAVBAR */}
      <div className={`${secondNavBase} shadow`}>
        {/* Desktop layout */}
        <div className="hidden lg:flex items-center px-4 py-3 max-w-[1400px] mx-auto">
          {/* Left buttons */}
          <div className="flex items-center gap-3">
            <button
              className="bg-blue-600 text-white px-3 py-1 rounded"
              onClick={() => {
                setActiveSection("add");
                setSelected(null);
                setSelectedMeta(null);
                setForm({ title: "", key: "", background: "", notes: null });
              }}
            >
              Add Topic
            </button>
            <button
              className="bg-green-600 text-white px-3 py-1 rounded"
              onClick={() => {
                setActiveSection("view");
                setActiveTab("key");
              }}
            >
              View Topics
            </button>
            <button
              className="bg-yellow-400 text-black px-3 py-1 rounded"
              onClick={() => {
                if (selected) setActiveSection("edit");
              }}
              disabled={!selected}
            >
              Edit/Delete Topic
            </button>
            
          </div>

          {/* Center search */}
          <div className="flex-1 px-6 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topics, policies..."
              className={`w-full border rounded px-3 py-2 ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white"}`}
            />
            {search.trim() && (
              <div className={`absolute left-0 right-0 mt-1 w-full max-h-60 overflow-y-auto rounded shadow border z-40 ${darkMode ? "bg-white text-gray-600 border-gray-700" : "bg-gray-700 text-white border-gray-300"}`}>
                {filteredTopics.length > 0 ? (
                  filteredTopics.map((topic) => (
                    <div
                      key={topic._id}
                      onClick={() => { handleSelect(topic); setSearch(""); }}
                      className={`cursor-pointer px-4 py-2 hover:bg-blue-200 ${selected?._id === topic._id ? "bg-blue-500 text-white" : ""}`}
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
           

          {/* Right actions */}
          
        </div>

        {/* Mobile layout (Option A) */}
        <div className="lg:hidden flex items-center gap-2 px-3 py-3">
           {/* Mobile open button inside header area */}
        {!sideOpen && (
          <button
            className="lg:hidden m-3 p-2 text-white bg-blue-600 rounded shadow w-[30px]"
            onClick={() => setSideOpen(true)}
          >
            +
          </button>
        )}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics..."
            className={`flex-1 border rounded px-3 py-2 ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white"}`}
          />
          <button
            className="ml-2 p-2 bg-blue-600 text-white rounded transition-all duration-300 ease-in-out"
            onClick={() => setMenuOpen((s) => !s)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>

        {/* Mobile menu drawer content */}
      <div
  className={`
    lg:hidden overflow-hidden transition-all duration-500 ease-in-out 
    ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
  `}
>
  <div className={`${secondNavBase} p-3 border-t`}>
    <div className="flex flex-col gap-2">
      
      <button
        className="w-full text-left bg-blue-600 text-white px-3 py-2 rounded"
        onClick={() => {
          setActiveSection("add");
          setMenuOpen(false);
        }}
      >
        Add Topic
      </button>

      <button
        className="w-full text-left bg-green-600 text-white px-3 py-2 rounded"
        onClick={() => {
          setActiveSection("view");
          setActiveTab("key");
          setMenuOpen(false);
        }}
      >
        View Topics
      </button>

      <button
        className="w-full text-left bg-yellow-400 text-black px-3 py-2 rounded"
        onClick={() => {
          if (selected) setActiveSection("edit");
          setMenuOpen(false);
        }}
        disabled={!selected}
      >
        Edit/Delete Topic
      </button>

    </div>
  </div>
</div>

      </div>

      <div className="flex flex-col lg:flex-row">
        {/* LEFT SIDEBAR */}
        <div
          className={`${sidebarBase} fixed lg:static inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out ${sideOpen ? "w-72" : "w-0"} overflow-hidden lg:w-72 lg:relative`}
        >
          <div className={sideOpen ? "block" : "hidden lg:block"}>
            <div className="p-4 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Key Topics</h3>
                <button className="lg:hidden text-xl text-gray-400" onClick={() => setSideOpen(false)}>✕</button>
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

              <div className="mt-4 text-xs text-gray-500">
                <div>© LevelUp</div>
              </div>
            </div>
          </div>
        </div>

        

        {/* MAIN CONTENT */}
        {/* Wrap printable area with ref for PDF export */}
        <main ref={pdfRef} className="flex-1 p-4 sm:p-6 lg:p-10 w-full max-w-full overflow-x-hidden">
          {/* VIEW TOPIC (with tabs and metadata) */}
          {activeSection === "view" && selected && (
            <>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-blue-600 mb-2">
                    Home / Topics / <span className={darkMode ? "text-white" : "text-gray-700"}>{selected.title}</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold">{selected.title}</h1>
                </div>

                <div className="flex items-center gap-3 mt-4 lg:mt-0">
                   <div className="max-w-6xl mx-auto px-4 pt-4 flex justify-end ">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-2 px-4 py-2 rounded-full    border  
                       hover:bg-gray-400 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>
                </div>
              </div>

              {/* Metadata + action buttons */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-gray-700 p-4 rounded shadow mb-6">
                <div className="flex items-center gap-3">
                  <button onClick={exportTopicPDF} className="bg-blue-600   px-3 py-1 rounded text-white flex flex-row">
                     <svg width="22" height="22" fill="currentColor">
  <path d="M11 2l4 4h-3v6h-2V6H7l4-4zm-7 12h2v4h10v-4h2v6H4v-6z"/>
</svg>
                    Export</button>
                  <button onClick={emailTopic} className="bg-yellow-400   px-3 py-1 rounded text-white flex flex-row">
                     <svg width="22" height="22" fill="currentColor">
  <path d="M2 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5zm16 0H4l7 5 7-5zm0 12V8l-7 5-7-5v9h14z"/>
</svg>

                    Email</button>
                  <button onClick={handlePrint} className="bg-red-800  px-3 py-1 rounded text-white flex flex-row">
                    <svg width="22" height="22" fill="currentColor">
  <path d="M6 3h10v4H6V3zm-2 6h14a2 2 0 0 1 2 2v5h-4v-3H6v3H2v-5a2 2 0 0 1 2-2zm4 9h8v-4H8v4z"/>
</svg>
                    Print</button>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center text-sm text-white mt-4 lg:mt-0">
                  <div className="flex items-center gap-2">
                  🕒
                    <span>Last updated: {selectedMeta ? timeAgo(selectedMeta.updatedAt || selectedMeta.createdAt) : "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                  <svg width="22" height="22" fill="currentColor">
  <path d="M11 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10c4.4 
   0 8 2.2 8 5v3H3v-3c0-2.8 3.6-5 8-5z"/>
</svg>

                    <span>Updated by: {selectedMeta?.updatedBy?.name || selectedMeta?.createdBy?.name || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" fill="currentColor">
 <path d="M10 4c4 0 7.5 2.5 9 6-1.5 3.5-5 6-9 
 6s-7.5-2.5-9-6c1.5-3.5 5-6 9-6zm0 
 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
</svg>

                    <span>{selectedMeta?.views || 0} views</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
             <div className="w-full bg-gray-700 dark:bg-[#111827] border-b dark:border-gray-700">
  <div className="flex flex-wrap justify-center gap-4 text-center w-full">

    {/* Key Messages */}
    <button
      onClick={() => setActiveTab("key")}
      className={`px-4 py-3 font-medium transition
        ${
          activeTab === "key"
            ? "border-b-2 border-red-600 text-red-600 dark:text-red-400"
            : "text-white dark:text-gray-300 hover:text-gray-400 dark:hover:text-white"
        }
      `}
    >
      Key Messages
    </button>

    {/* Background */}
    <button
      onClick={() => setActiveTab("background")}
      className={`px-4 py-3 font-medium transition
        ${
          activeTab === "background"
            ? "border-b-2 border-red-600 text-red-600 dark:text-red-400"
            : "text-white dark:text-gray-300 hover:text-gray-400 dark:hover:text-white"
        }
      `}
    >
      Background
    </button>

    {/* Notes */}
    <button
      onClick={() => setActiveTab("notes")}
      className={`px-4 py-3 font-medium transition
        ${
          activeTab === "notes"
            ? "border-b-2 border-red-600 text-red-600 dark:text-red-400"
            : "text-white dark:text-gray-300 hover:text-gray-400 dark:hover:text-white"
        }
      `}
    >
      Notes & Resources
    </button>

  </div>
</div>


              {/* Tab content */}
              <div className="bg-gray-500 p-6 rounded shadow">
                {activeTab === "key" && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-white">Core Messages</h3>
                    <div className="space-y-4">
                      {parseCoreMessages(selected.key).map((msg, idx) => (
                        <div key={idx} className="p-4 border rounded bg-blue-300">
                          <div className="text-sm text-blue-600 font-semibold mb-2"> {idx + 1}. </div>
                          <div className="text-sm whitespace-pre-line text-white font-semibold">{msg}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "background" && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-white">Background</h3>
                    <div className="prose max-w-none whitespace-pre-line text-white">{selected.background}</div>
                  </div>
                )}

                {activeTab === "notes" && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-white">Notes & Resources</h3>
                    {selected.notes && selected.notes.filename ? (
                      selected.notes.filename.toLowerCase().endsWith(".pdf") ? (
                      <iframe src={`/api/topics/${selected._id}/notes`} width="100%" height="500" title="PDF Viewer" />
                      ) : selected.notes.filename.match(/\.(docx?|pptx?|xlsx?)$/i) ? (
                        <iframe src={`https://docs.google.com/gview?url=${window.location.origin}/api/topics/${selected._id}/notes&embedded=true`} width="100%" height="500" title="Doc Viewer" />
                      ) : (
                        <a href={`/api/topics/${selected._id}/notes`} target="_blank" rel="noopener noreferrer">Open Document</a>
                      )
                    ) : (
                      <p className="text-gray-500">No notes uploaded.</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ADD TOPIC */}
          {activeSection === "add" && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold mb-4">Add New Topic</h2>

             {/* Tabs for ADD */}
<div className="bg-gray-700 p-2 rounded shadow mb-6">
  <div className="flex border-b -mx-2">
    <button
      className={`px-4 py-2 -mb-px ${formTab === "key" ? "border-b-2 border-red-500 text-red-600" : "text-white"}`}
      onClick={() => setFormTab("key")}
    >
      Key Messages
    </button>
    <button
      className={`px-4 py-2 -mb-px ${formTab === "background" ? "border-b-2 border-red-500 text-red-600" : "text-white"}`}
      onClick={() => setFormTab("background")}
    >
      Background
    </button>
    <button
      className={`px-4 py-2 -mb-px ${formTab === "notes" ? "border-b-2 border-red-500 text-red-600" : "text-white"}`}
      onClick={() => setFormTab("notes")}
    >
      Notes File
    </button>
  </div>
</div>

{/* Add Topic Form Based on Tab */}
<div className="bg-gray-700 p-6 rounded shadow">
  {formTab === "key" && (
    <div>
      <h3 className="font-semibold mb-2 text-white">Topic Name</h3>
      <input
        type="text"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="w-full border p-3 rounded mb-4 text-lg bg-blue-200 text-gray-700"
      />

      <h3 className="font-semibold mb-2 text-white">Key Messages</h3>
      <textarea
        value={form.key}
        onChange={(e) => setForm({ ...form, key: e.target.value })}
        className="w-full border p-3 rounded text-lg min-h-[150px] bg-blue-200 text-gray-700"
      />
    </div>
  )}

  {formTab === "background" && (
    <div>
      <h3 className="font-semibold mb-2 text-white">Background</h3>
      <textarea
        value={form.background}
        onChange={(e) => setForm({ ...form, background: e.target.value })}
        className="w-full border p-3 rounded text-lg min-h-[250px] bg-blue-200 text-gray-700"
      />
    </div>
  )}

  {formTab === "notes" && (
    <div>
      <h3 className="font-semibold mb-2 text-white">Notes File</h3>
      <input
        type="file"
        onChange={(e) => setForm({ ...form, notes: e.target.files[0] })}
        className="w-full border p-2 rounded bg-blue-200 min-h-[250px] text-gray-700"
      />
    </div>
  )}
</div>

 

              <div className="mt-6">
                <button onClick={handleAdd} className="bg-orange-700 text-white px-4 py-2 rounded">Add Topic</button>
              </div>
            </div>
          )}

          {/* EDIT TOPIC */}
          {activeSection === "edit" && selected && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold mb-4">Edit Topic</h2>

             {/* Tabs for EDIT */}
<div className="bg-gray-700 p-2 rounded shadow mb-6">
  <div className="flex border-b -mx-2">
    <button
      className={`px-4 py-2 -mb-px ${formTab === "key" ? "border-b-2 border-red-500 text-red-600" : "text-white"}`}
      onClick={() => setFormTab("key")}
    >
      Key Messages
    </button>
    <button
      className={`px-4 py-2 -mb-px ${formTab === "background" ? "border-b-2 border-red-500 text-red-600" : "text-white"}`}
      onClick={() => setFormTab("background")}
    >
      Background
    </button>
    <button
      className={`px-4 py-2 -mb-px ${formTab === "notes" ? "border-b-2 border-red-500 text-red-600" : "text-white"}`}
      onClick={() => setFormTab("notes")}
    >
      Notes File
    </button>
  </div>
</div>

{/* Edit Topic Form Based on Tab */}
<div className="bg-gray-700 p-6 rounded shadow">
  {formTab === "key" && (
    <div>
      <h3 className="font-semibold mb-2 text-white">Topic Name</h3>
      <input
        type="text"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="w-full border p-3 rounded mb-4 text-lg bg-blue-200 text-gray-700"
      />

      <h3 className="font-semibold mb-2 text-white">Key Messages</h3>
      <textarea
        value={form.key}
        onChange={(e) => setForm({ ...form, key: e.target.value })}
        className="w-full border p-3 rounded text-lg min-h-[150px] bg-blue-200 text-gray-700"
      />
    </div>
  )}

  {formTab === "background" && (
    <div>
      <h3 className="font-semibold mb-2 text-white">Background</h3>
      <textarea
        value={form.background}
        onChange={(e) => setForm({ ...form, background: e.target.value })}
        className="w-full border p-3 rounded text-lg min-h-[250px] bg-blue-200 text-gray-700"
      />
    </div>
  )}

  {formTab === "notes" && (
    <div>
      <h3 className="font-semibold mb-2 text-white">Notes File</h3>
      <input
        type="file"
        onChange={(e) => setForm({ ...form, notes: e.target.files[0] })}
        className="w-full border p-2 rounded min-h-[250px] bg-blue-200 text-gray-700"
      />
      {selected?.notes && (
        <p className="mt-2 text-sm">Current: {selected.notes}</p>
      )}
    </div>
  )}
</div>

 


              <div className="mt-6 flex gap-4">
                <button onClick={handleEdit} className="bg-yellow-400 text-black px-4 py-2 rounded">Update Topic</button>
                <button onClick={() => handleDelete(selected._id)} className="bg-red-500 text-white px-4 py-2 rounded">Delete Topic</button>
              </div>
            </div>
          )}

          {/* NO TOPIC SELECTED MESSAGE */}
          {activeSection === "view" && !selected && (
            <p className="text-center mt-10 text-gray-400">Select a topic from the sidebar to view details.</p>
          )}
        </main>
      </div>
    </div>
  );
}
