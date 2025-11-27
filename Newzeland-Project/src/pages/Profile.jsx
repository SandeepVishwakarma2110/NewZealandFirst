import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNavbar from "../components/TopNavbar";

const roleLabels = { 0: "Super Admin", 1: "Admin", 2: "Field User" };

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [contactEdit, setContactEdit] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [form, setForm] = useState({ name: "", email: "", role: 2 });
  const [contact, setContact] = useState({ phone: "", address: "" });

  const [stats, setStats] = useState({
    documents: 0,
    contributions: 0,
    users: 0,
    actions: 0,
  });

  const navigate = useNavigate();
    const handleEdit = () => setEdit(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data.profile);
        setForm({
          name: data.profile.name,
          email: data.profile.email,
          role: data.profile.role,
        });
        setContact({
          phone: data.profile.phone || "",
          address: data.profile.address || "",
        });
      });

    fetch("/api/profile/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, []);

  if (!profile) return <div className="p-8">Loading...</div>;

  return (
    <>
      <TopNavbar />
      
      {/* MAIN WRAPPER */}
      <div
        className={`max-w-5xl mx-auto mt-6 mb-24 p-6 rounded-xl transition 
        ${darkMode ? "bg-[#0f1114] text-gray-300" : "bg-white text-gray-700"}
      `}
      >

        {/* HEADER SECTION */}
     {/* HEADER SECTION */}
<div className="w-full max-w-4xl mx-auto px-4 mt-6">

  {/* MOBILE — CENTERED */}
  <div className="md:hidden flex flex-col items-center text-center">

    {/* Avatar */}
    <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow">
      {profile.name?.charAt(0).toUpperCase()}
    </div>

    {/* Name */}
    <h2 className="mt-3 text-2xl font-bold">{profile.name}</h2>

    {/* Badge */}
    <span className="mt-2 px-4 py-1 rounded-full text-sm text-white bg-red-500">
      Level {profile.role} • {roleLabels[profile.role]}
    </span>

    {/* Edit Button */}
    <button
      onClick={handleEdit}
      className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 shadow"
    >
      ✏️ Edit Profile
    </button>

    {/* Dark Mode Toggle */}
    <button
      onClick={() => setDarkMode(!darkMode)}
      className={`mt-3 px-5 py-2 rounded-lg shadow border flex items-center gap-2
        ${darkMode ? "bg-[#1b1d1f] text-gray-200 border-gray-700" : "bg-white text-gray-700"}
      `}
    >
      {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  </div>

  {/* DESKTOP — LEFT ALIGNED */}
  <div className="hidden md:flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow">
        {profile.name?.charAt(0).toUpperCase()}
      </div>

      <div>
        <h2 className="text-3xl font-bold">{profile.name}</h2>
        <span className="mt-1 inline-block px-4 py-1 rounded-full text-sm text-white bg-red-500">
          Level {profile.role} • {roleLabels[profile.role]}
        </span>
      </div>
    </div>

    {/* Edit + Dark Mode Buttons (Desktop) */}
    <div className="flex items-center gap-3">
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`px-5 py-2 rounded-lg shadow border flex items-center gap-2
          ${darkMode ? "bg-[#1b1d1f] text-gray-200 border-gray-700" : "bg-white text-gray-700"}
        `}
      >
        🌙 Dark Mode
      </button>

      <button
        onClick={handleEdit}
        className="px-5 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 shadow"
      >
        ✏️ Edit Profile
      </button>
    </div>
  </div>

</div>


        {/* ABOUT SECTION */}
        <SectionCard title="About" darkMode={darkMode}>
          {edit ? (
            <div className="flex flex-col gap-3">
              <input
                className="border p-2 rounded"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="border p-2 rounded"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <button
                onClick={() => setEdit(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          ) : (
            <p className="text-gray-400 leading-relaxed">
              {profile.role === 0 &&
                "Super Administrator with full system access and platform management ability."}
              {profile.role === 1 &&
                "Admin responsible for managing topics and user submissions."}
              {profile.role === 2 &&
                "Field user with access to view topics & documents."}
            </p>
          )}
        </SectionCard>

       
      {/* CONTACT INFORMATION */}
<SectionCard   darkMode={darkMode}>
  <div className="flex justify-between items-center">
    <h3 className="text-lg font-semibold">Contact Information</h3>

    {!contactEdit && (
      <button
        onClick={() => setContactEdit(true)}
        className="text-blue-500 text-sm hover:underline"
      >
        Edit
      </button>
    )}
  </div>

  {contactEdit ? (
    <div className="mt-3 flex flex-col gap-3">
      <input
        className="border p-2 rounded"
        placeholder="Phone Number"
        value={contact.phone}
        onChange={(e) =>
          setContact({ ...contact, phone: e.target.value })
        }
      />

      <input
        className="border p-2 rounded"
        placeholder="Address"
        value={contact.address}
        onChange={(e) =>
          setContact({ ...contact, address: e.target.value })
        }
      />

      <button
        onClick={() => setContactEdit(false)}
        className="bg-blue-600 text-white px-4 py-2 rounded w-fit"
      >
        Save
      </button>
    </div>
  ) : (
    <div className="mt-3 space-y-2">
      <div>
        <b>📞 Phone:</b> {contact.phone || "-"}
      </div>
      <div>
        <b>📍 Address:</b> {contact.address || "-"}
      </div>
    </div>
  )}
</SectionCard>


        {/* STATISTICS SECTION */}
        <SectionCard title="Statistics" darkMode={darkMode}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
            <Stat label="Documents" value={stats.documents} />
            <Stat label="Contributions" value={stats.contributions} />
            <Stat label="Users Managed" value={stats.users} />
            
          </div>
        </SectionCard>

        {/* LOGOUT */}
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="w-[80px] bg-red-600 text-white p-3 mt-6 rounded-lg"
        >
          Logout
        </button>
      </div>
    </>
  );
}

function SectionCard({ title, children, darkMode }) {
  return (
    <div
      className={`p-5 rounded-xl mb-6 transition
      ${darkMode ? "bg-[#1b1d1f]" : "bg-gray-100"}`}
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-3xl font-bold">{value}</div>
      <p className="text-gray-400">{label}</p>
    </div>
  );
}
