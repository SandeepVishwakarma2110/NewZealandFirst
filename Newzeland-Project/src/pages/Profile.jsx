

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNavbar from "../components/TopNavbar";
import { Eye, EyeOff } from "lucide-react";
import { Moon, Sun } from "lucide-react";

const roleLabels = { 0: "Super Admin", 1: "Admin", 2: "Field User" };

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [contactEdit, setContactEdit] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordMessage, setChangePasswordMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);


  const [form, setForm] = useState({ name: "", email: "", role: 2 });
  const [contact, setContact] = useState({ phone: "", address: "" });

  const [stats, setStats] = useState({
    documents: 0,
    contributions: 0,
    users: 0,
    actions: 0,
  });

  const navigate = useNavigate();

  const handleSubmitChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordLoading(true);
    setChangePasswordMessage(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "/api/auth/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(changePasswordForm),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setChangePasswordMessage({
          type: "success",
          text:
            data.message + " Redirecting to login page..." ||
            "Password changed successfully ! Redirecting to login page...",
        });
        setChangePasswordForm({
          currentPassword: "",
          newPassword: "",
        });

        setTimeout(() => {
          navigate("/login");
        }, 1000);

      } else {
        setChangePasswordMessage({
          type: "error",
          text:
            data.message ||
            "Failed to change password",
        });
      }
    } catch {
      setChangePasswordMessage({
        type: "error",
        text: "Server error",
      });
    } finally {
      setChangePasswordLoading(false);
    }
  };


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
  }

    , []);

  if (!profile) return <div className="p-8">Loading...</div>;

  return (
    <>
      <TopNavbar />

      <div
        className={`max-w-5xl mx-auto mt-6 mb-24 p-6 rounded-xl transition
        ${darkMode ? "bg-[#0f1114] text-gray-300" : "bg-white text-gray-700"}`}
      >
        {/* HEADER */}
        <div className="w-full max-w-4xl mx-auto px-4 mt-6">
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow">
                {profile.name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h2 className="text-3xl font-bold">{profile.name}</h2>
                <span className="inline-block px-4 py-1 rounded-full text-sm text-white bg-red-500">
                  Level {profile.role} • {roleLabels[profile.role]}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 ">

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border 
                       hover:bg-gray-200  transition"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
              </button>


              <button
                onClick={() => setEdit(true)}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow transform transition duration-100 active:scale-97"
              >
                ✏️ Edit Profile
              </button>

              <button
                onClick={() => setShowChangePassword(true)}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow transform transition duration-100 active:scale-97"
              >
                🔒 Change Password
              </button>
            </div>
          </div>
        </div>
        {/* MOBILE PROFILE HEADER */}
        <div className="md:hidden flex flex-col items-center text-center gap-4 mt-6">

          {/* Avatar */}
          <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow">
            {profile.name?.charAt(0).toUpperCase()}
          </div>

          {/* Name */}
          <h2 className="text-2xl font-bold">{profile.name}</h2>

          {/* Role */}
          <span className="px-4 py-1 rounded-full text-sm text-white bg-red-500">
            Level {profile.role} • {roleLabels[profile.role]}
          </span>

          {/* Buttons */}
          <div className="w-full flex flex-col gap-3 mt-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border 
                       hover:bg-gray-200 transition"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </button>

            <button
              onClick={() => setEdit(true)}
              className="w-full px-5 py-2 bg-blue-600 text-white rounded-lg shadow transform transition duration-100 active:scale-97"
            >
              ✏️ Edit Profile
            </button>

            <button
              onClick={() => setShowChangePassword(true)}
              className="w-full px-5 py-2 bg-blue-600 text-white rounded-lg shadow transform transition duration-100 active:scale-97"
            >
              🔒 Change Password
            </button>
          </div>
        </div>

        {/* ABOUT */}
        <SectionCard title="About" darkMode={darkMode}>
          {edit ? (
            <div className="flex flex-col gap-3">
              <input
                className="border p-2 rounded"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
              <button
                onClick={() => setEdit(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          ) : (
            <p className="text-gray-400">
              {profile.role === 0 &&
                "Super Administrator with full system access and platform management ability."}
              {profile.role === 1 &&
                "Admin responsible for managing topics and user submissions."}
              {profile.role === 2 &&
                "Field user with access to view topics & documents."}
            </p>
          )}
        </SectionCard>

        {/* CONTACT */}
        <SectionCard title="Contact Information" darkMode={darkMode}>
          {!contactEdit ? (
            <>
              <div className="space-y-2">
                <div>📞 {contact.phone || "-"}</div>
                <div>📍 {contact.address || "-"}</div>
              </div>
              <button
                onClick={() => setContactEdit(true)}
                className="text-blue-500 text-sm mt-2"
              >
                Edit
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <input
                className="border p-2 rounded"
                value={contact.phone}
                onChange={(e) =>
                  setContact({ ...contact, phone: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
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
          )}
        </SectionCard>

        {/* STATS */}
        <SectionCard title="Statistics" darkMode={darkMode}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
            <Stat label="Documents" value={stats.documents} />
            <Stat label="Contributions" value={stats.contributions} />
            <Stat label="Users Managed" value={stats.users} />
          </div>
        </SectionCard>

        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="w-[80px] bg-red-600 text-white p-3 mt-6 rounded-lg transform transition duration-100 active:scale-97"
        >
          Logout
        </button>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white text-gray-900 rounded-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2"
              onClick={() => {
                setShowChangePassword(false);
                setChangePasswordForm({
                  currentPassword: "",
                  newPassword: "",
                });
                setChangePasswordMessage(null);
              }}
            >
              ✖
            </button>

            <h2 className="text-xl font-bold mb-4">Change Password</h2>

            <form
              onSubmit={handleSubmitChangePassword}
              className="flex flex-col gap-4"
            >

              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="password"
                  placeholder="Current Password"
                  value={changePasswordForm.currentPassword}
                  onChange={(e) =>
                    setChangePasswordForm((f) => ({
                      ...f,
                      currentPassword: e.target.value,
                    }))
                  }
                  autoComplete="Current-password"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  data-lpignore="true"
                  className="border p-2 rounded w-full"
                  required
                />


                {/* Eye Icon (always visible) */}
                <span
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 select-none"
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>


              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="New Password"
                  value={changePasswordForm.newPassword}
                  onChange={(e) =>
                    setChangePasswordForm((f) => ({
                      ...f,
                      newPassword: e.target.value,
                    }))
                  }
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  data-lpignore="true"
                  className="border p-2 rounded w-full"
                  required
                />


                {/* Eye Icon (always visible) */}
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 select-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>


              <button
                type="submit"
                disabled={changePasswordLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
              >
                {changePasswordLoading
                  ? "Changing..."
                  : "Change Password"}
              </button>

              {changePasswordMessage && (
                <p
                  className={`text-sm ${changePasswordMessage.type === "success"
                    ? "text-green-600"
                    : "text-red-600"
                    }`}
                >
                  {changePasswordMessage.text}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function SectionCard({ title, children, darkMode }) {
  return (
    <div
      className={`p-5 rounded-xl mb-6
      ${darkMode ? "bg-[#1b1d1f]" : "bg-gray-100"}`}
    >
      {title && (
        <h3 className="text-xl font-semibold mb-2">
          {title}
        </h3>
      )}
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