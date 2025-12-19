import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/register-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: 2 }),
      });
      const data = await res.json();
      setMessage(data.message);
    } catch {
      setMessage("Request failed");
    }
  };

  return (
    <div
      className={`flex flex-col md:flex-row min-h-screen transition-colors duration-500 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
        }`}
    >
      {/* ---------- Left Section ---------- */}
      <div className="flex-1 flex flex-col justify-center items-center bg-[#1a1a1a] text-white p-10">
        <div className="max-w-sm">
          <div className="flex items-center mb-4">
            <div className="bg-red-600 p-2 rounded-md">
              <span className="text-white text-xl font-bold">▶</span>
            </div>
            <h2 className="ml-2 text-lg font-semibold">NZ First</h2>
          </div>

          <h1 className="text-4xl font-bold mb-2">
            Level<span className="text-red-500">Up</span>
          </h1>
          <p className="text-gray-400 mb-8">
            Empowering New Zealand&nbsp;
            <span className="text-red-500 font-semibold">First</span> with
            Knowledge
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-[#2a2a2a] p-4 rounded-lg">
              <div className="text-red-500 text-2xl mb-2">⚡</div>
              <h3 className="font-semibold">Instant Access</h3>
              <p className="text-sm text-gray-400">
                Quick search & retrieval
              </p>
            </div>

            <div className="bg-[#2a2a2a] p-4 rounded-lg">
              <div className="text-red-500 text-2xl mb-2">🔒</div>
              <h3 className="font-semibold">Secure Platform</h3>
              <p className="text-sm text-gray-400">
                Enterprise-grade security
              </p>
            </div>

            <div className="bg-[#2a2a2a] p-4 rounded-lg">
              <div className="text-red-500 text-2xl mb-2">🔁</div>
              <h3 className="font-semibold">Always Updated</h3>
              <p className="text-sm text-gray-400">
                Real-time information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Right Section ---------- */}
      <div
        className={`flex-1 flex justify-center items-center p-8 md:p-16 relative ${darkMode ? "bg-gray-800" : "bg-white"
          }`}
      >

        <div className="absolute top-4 right-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-sm px-3 py-1 border rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
        <div className="w-full max-w-sm">
          {/* Theme Toggle */}


          <h2 className="text-2xl font-bold mb-2">Register Request</h2>
          <p className="text-sm mb-6 text-gray-500 dark:text-gray-400">
            Submit your request to get access approval from admin.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-3 rounded-md bg-transparent dark:bg-gray-700 dark:border-gray-600 text-white"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-3 rounded-md bg-transparent dark:bg-gray-700 dark:border-gray-600 text-white"
              required
            />
            {/* <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full border p-3 rounded-md bg-transparent dark:bg-gray-700 dark:border-gray-600 text-white"
              required
            /> */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-lpignore="true"
                className="w-full border p-3 rounded-md bg-transparent dark:bg-gray-700 dark:border-gray-600 pr-10"
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
              className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-md transform transition duration-200 active:scale-95"
            >
              Submit Request
            </button>
          </form>

          {message && (
            <p className="mt-4 text-center text-red-500 font-medium">
              {message}
            </p>
          )}

          <div className="flex justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
            <Link to="/login" className="hover:underline">
              Already have an account Login
            </Link>
          </div>

          <div className="flex justify-center gap-6 mt-6 text-xs text-gray-400 dark:text-gray-500">
            <div>✅ SOC-2 Compliant</div>
            <div>🔐 256-bit Encryption</div>
            <div>🛡 GDPR Compliant</div>
          </div>
        </div>
      </div>
    </div>
  );
}
