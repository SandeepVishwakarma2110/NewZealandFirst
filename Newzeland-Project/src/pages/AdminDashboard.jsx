// import { useEffect, useState } from "react";
// import TopNavbar from "../components/TopNavbar";
// import { Moon, Sun } from "lucide-react";
// const roleLabels = { 0: "Level 0", 1: "Level 1", 2: "Level 2" };

// export default function AdminDashboard() {
//   const [darkMode, setDarkMode] = useState(false);

//   const [stats, setStats] = useState({
//     users: 0,
//     topics: 0,
//     topicsMonth: 0,
//     commentsToday: 0,
//   });

//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [userSearch, setUserSearch] = useState("");
//   const [userSuggestions, setUserSuggestions] = useState([]);

//   const [newUser, setNewUser] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: 2,
//   });

//   const [requests, setRequests] = useState([]);
//   const [filteredRequests, setFilteredRequests] = useState([]);
//   const [requestSearch, setRequestSearch] = useState("");
//   const [requestSuggestions, setRequestSuggestions] = useState([]);
//   const [message, setMessage] = useState("");
//   const [addUserError, setAddUserError] = useState("");

//   // ---------------- FETCH STATS + USERS ----------------
//   useEffect(() => {
//     fetch("/api/admin/stats", {
//       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//     })
//       .then((res) => res.json())
//       .then((data) => setStats(data));

//     fetch("/api/admin/users", {
//       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         setUsers(data.users || []);
//         setFilteredUsers(data.users || []);
//       });
//   }, []);

//   // ---------------- USER SEARCH FILTER ----------------
//   useEffect(() => {
//     if (!userSearch) {
//       setFilteredUsers(users);
//       setUserSuggestions([]);
//     } else {
//       const search = userSearch.toLowerCase();
//       const filtered = users.filter(
//         (u) =>
//           u.name.toLowerCase().includes(search) ||
//           u.email.toLowerCase().includes(search)
//       );
//       setFilteredUsers(filtered);
//       setUserSuggestions(filtered.slice(0, 5));
//     }
//   }, [userSearch, users]);

//   // ---------------- ADD USER ----------------
//   // const handleAddUser = async (e) => {
//   //   e.preventDefault();

//   //   await fetch("/api/admin/users", {
//   //     method: "POST",
//   //     headers: {
//   //       "Content-Type": "application/json",
//   //       Authorization: `Bearer ${localStorage.getItem("token")}`,
//   //     },
//   //     body: JSON.stringify(newUser),
//   //   });

//   //   setNewUser({ name: "", email: "", password: "", role: 2 });

//   //   const res = await fetch("/api/admin/users", {
//   //     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//   //   });
//   //   const data = await res.json();
//   //   setUsers(data.users || []);
//   // };
//   const handleAddUser = async (e) => {
//     e.preventDefault();
//     // Validation
//     if (!newUser.name || !newUser.email || !newUser.password) {
//       setAddUserError("All fields are required.");
//       return;
//     }
//     // Simple email format check
//     if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newUser.email)) {
//       setAddUserError("Please enter a valid email address.");
//       return;
//     }
//     setAddUserError("");
//     const response = await fetch("/api/admin/users", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${localStorage.getItem("token")}`,
//       },
//       body: JSON.stringify(newUser),
//     });
//     const data = await response.json();
//     if (!response.ok) {
//       setAddUserError(data.message || "Failed to add user.");
//       return;
//     }
//     setNewUser({ name: "", email: "", password: "", role: 2 });
//     const res = await fetch("/api/admin/users", {
//       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//     });
//     const usersData = await res.json();
//     setUsers(usersData.users || []);
//   };

//   // ---------------- DELETE USER ----------------
//   const handleDeleteUser = async (userId) => {
//     if (!window.confirm("Are you sure you want to delete this user?")) return;
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(`/api/admin/users/${userId}`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await res.json();
//       if (res.ok) {
//         // Remove user from UI
//         setUsers(users => users.filter(u => u._id !== userId));
//         alert("User deleted successfully.");
//       } else {
//         alert(data.message || "Failed to delete user.");
//       }
//     } catch (err) {
//       alert("Server error.");
//     }
//   };

//   // ---------------- FETCH REQUESTS ----------------
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     fetch("/api/register-requests", {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         setRequests(data.requests || []);
//         setFilteredRequests(data.requests || []);
//       });
//   }, [message]);

//   // ---------------- REQUEST SEARCH ----------------
//   useEffect(() => {
//     if (!requestSearch) {
//       setFilteredRequests(requests);
//       setRequestSuggestions([]);
//     } else {
//       const search = requestSearch.toLowerCase();
//       const filtered = requests.filter(
//         (r) =>
//           r.name.toLowerCase().includes(search) ||
//           r.email.toLowerCase().includes(search)
//       );
//       setFilteredRequests(filtered);
//       setRequestSuggestions(filtered.slice(0, 5));
//     }
//   }, [requestSearch, requests]);

//   // ---------------- APPROVE / REJECT REQUEST ----------------
//   const handleAction = async (id, action) => {
//     setMessage("");
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(
//         `/api/register-requests/${id}/${action}`,
//         {
//           method: "POST",
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       const data = await res.json();
//       setMessage(data.message);
//     } catch {
//       setMessage("Action failed");
//     }
//   };

//   // ---------------- CHANGE ROLE ----------------
//   const handleRoleChange = async (id, role) => {
//     setMessage("");
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(
//         `/api/register-requests/${id}/role`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ role }),
//         }
//       );
//       const data = await res.json();
//       setMessage(data.message);
//     } catch {
//       setMessage("Role update failed");
//     }
//   };

//   // ---------------- THEME CLASSES ----------------
//   const pageBG = darkMode
//     ? "bg-[#121314] text-gray-200"
//     : "bg-gray-100 text-gray-700";

//   const cardBG = darkMode
//     ? "bg-[#1b1d1f] text-gray-300"
//     : "bg-white text-gray-700";

//   return (
//     <>
//       <TopNavbar />

//       <div className={`${pageBG} min-h-screen px-4 py-6 pb-20`}>
//         {/* ---------- HEADER WITH DARK MODE BUTTON ---------- */}
//         <div className="max-w-6xl mx-auto px-4 pt-4 flex justify-end ">
//           <button
//             onClick={() => setDarkMode(!darkMode)}
//             className="flex items-center gap-2 px-4 py-2 rounded-full    border  
//                        hover:bg-gray-400 dark:hover:bg-gray-700 transition"
//           >
//             {darkMode ? <Sun size={18} /> : <Moon size={18} />}
//             <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
//           </button>
//         </div>
//         <div className="max-w-5xl mx-auto flex justify-between items-center mb-6">
//           <h1 className="text-3xl font-bold">Admin Dashboard</h1>



//         </div>


//         <div className="max-w-5xl mx-auto space-y-10">
//           {/* ---------------- SYSTEM DASHBOARD ---------------- */}
//           <div className={`${cardBG} p-6 rounded-lg shadow`}>
//             <h2 className="text-xl font-semibold mb-4">System Dashboard</h2>

//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//               <div className={`${cardBG} p-4 rounded shadow bg-gray-600`}>
//                 <svg width="22" height="22" fill="currentColor">
//                   <path d="M11 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10c4.4 
//    0 8 2.2 8 5v3H3v-3c0-2.8 3.6-5 8-5z"/>
//                 </svg>

//                 <p>Total Users</p>
//                 <h3 className="text-2xl font-bold">{stats.users}</h3>
//               </div>

//               <div className={`${cardBG} p-4 rounded shadow bg-gray-600`}>
//                 <svg width="20" height="20" fill="currentColor">
//                   <path d="M4 2h8l4 4v10a2 2 0 0 1-2 2H4a2 
//   2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V6h3.5L12 
//   3.5z"/>
//                 </svg>

//                 <p>Total Documents</p>
//                 <h3 className="text-2xl font-bold">{stats.topics}</h3>
//               </div>

//               <div className={`${cardBG} p-4 rounded shadow bg-gray-600`}>
//                 <svg width="20" height="20" fill="currentColor">
//                   <path d="M3 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 
//  2v8a2 2 0 0 1-2 2H7l-4 3V4z"/>
//                 </svg>

//                 <p>Topics This Month</p>
//                 <h3 className="text-2xl font-bold">{stats.topicsMonth}</h3>
//               </div>

//               <div className={`${cardBG} p-4 rounded shadow bg-gray-600`}>
//                 <svg width="20" height="20" fill="currentColor">
//                   <path d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 
//  1 2 2v6a2 2 0 0 1-2 2H6l-4 3V4zm10 2h4a2 2 
//  0 0 1 2 2v6l-3-2h-3a2 2 0 0 1-2-2v-2"/>
//                 </svg>


//                 <p>Comments Today</p>
//                 <h3 className="text-2xl font-bold">{stats.commentsToday}</h3>
//               </div>
//             </div>
//           </div>

//           {/* ---------------- REGISTRATION REQUESTS ---------------- */}
//           <div className={`${cardBG} p-6 rounded-lg shadow`}>
//             <h2 className="text-xl font-semibold mb-4">
//               Registration Requests
//             </h2>

//             <input
//               type="text"
//               className="border-gray-500 p-2 rounded w-full mb-2 bg-gray-500 text-white placeholder:text-white"
//               placeholder="Search registrations..."
//               value={requestSearch}
//               onChange={(e) => setRequestSearch(e.target.value)}
//             />

//             {requestSuggestions.length > 0 && (
//               <div className="bg-white border rounded shadow max-h-32 overflow-y-auto absolute z-10 w-[30%] content-center  ">
//                 {requestSuggestions.map((r) => (
//                   <div
//                     key={r._id}
//                     className="px-3 py-1 cursor-pointer hover:bg-blue-300"
//                     onClick={() => {
//                       setRequestSearch(r.name);
//                       setFilteredRequests([r]);
//                       setRequestSuggestions([]);
//                     }}
//                   >
//                     {r.name} <span className="text-black">({r.email})</span>
//                   </div>
//                 ))}
//               </div>
//             )}

//             <div className="overflow-x-auto mt-4">
//               <table className="w-full border">
//                 <thead>
//                   <tr className="bg-blue-300">
//                     <th className="p-2">Name</th>
//                     <th className="p-2">Email</th>
//                     <th className="p-2">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredRequests.map((r) => (
//                     <tr key={r._id} className="border-t">
//                       <td className="p-2">{r.name}</td>
//                       <td className="p-2">{r.email}</td>
//                       <td className="p-2">
//                         {r.status === "pending" && (
//                           <>
//                             <button
//                               onClick={() => handleAction(r._id, "approve")}
//                               className="bg-green-600 text-white px-2 py-1 rounded mr-2"
//                             >
//                               Approve
//                             </button>
//                             <button
//                               onClick={() => handleAction(r._id, "reject")}
//                               className="bg-red-600 text-white px-2 py-1 rounded"
//                             >
//                               Reject
//                             </button>
//                           </>
//                         )}

//                         {r.status === "approved" && (
//                           <span className="text-green-600 font-semibold">
//                             Approved
//                           </span>
//                         )}

//                         {r.status === "rejected" && (
//                           <span className="text-red-600 font-semibold">
//                             Rejected
//                           </span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* ---------------- USER MANAGEMENT ---------------- */}
//           <div className={`${cardBG} p-6 rounded-lg shadow`}>
//             <h2 className="text-xl font-semibold mb-4">User Management</h2>

//             <input
//               type="text"
//               className="border-gray-500 p-2 rounded w-full mb-2 bg-gray-500 text-white placeholder:text-white"
//               placeholder="Search users..."
//               value={userSearch}
//               onChange={(e) => setUserSearch(e.target.value)}
//             />

//             {userSuggestions.length > 0 && (
//               <div className="bg-white border rounded shadow max-h-32 overflow-y-auto absolute z-10 w-[30%]">
//                 {userSuggestions.map((u) => (
//                   <div
//                     key={u._id}
//                     className="px-3 py-1 cursor-pointer hover:bg-blue-300"
//                     onClick={() => {
//                       setUserSearch(u.name);
//                       setFilteredUsers([u]);
//                       setUserSuggestions([]);
//                     }}
//                   >
//                     {u.name} <span className="text-black">({u.email})</span>
//                   </div>
//                 ))}
//               </div>
//             )}

//             <form
//               onSubmit={handleAddUser}
//               className="flex flex-wrap gap-2 mt-4"
//             >
//               <input
//                 type="text"
//                 placeholder="Name"
//                 className="border-gray-500 p-2 rounded flex-1 bg-gray-500 placeholder:text-white"
//                 value={newUser.name}
//                 onChange={(e) =>
//                   setNewUser((prev) => ({ ...prev, name: e.target.value }))
//                 }
//               />
//               <input
//                 type="email"
//                 placeholder="Email"
//                 className="border-gray-500 p-2 rounded flex-1 bg-gray-500 placeholder:text-white"
//                 value={newUser.email}
//                 onChange={(e) =>
//                   setNewUser((prev) => ({ ...prev, email: e.target.value }))
//                 }
//               />
//               <input
//                 type="password"
//                 placeholder="Password"
//                 className="border-gray-500 p-2 rounded flex-1 bg-gray-500 placeholder:text-white"
//                 value={newUser.password}
//                 onChange={(e) =>
//                   setNewUser((prev) => ({ ...prev, password: e.target.value }))
//                 }
//               />
//               <select
//                 className="border-gray-500 p-2 rounded bg-gray-500 text-white"
//                 value={newUser.role}
//                 onChange={(e) =>
//                   setNewUser((prev) => ({
//                     ...prev,
//                     role: Number(e.target.value),
//                   }))
//                 }
//               >

//                 <option value={2}  >Level 2</option>
//                 <option value={1}  >Level 1</option>
//                 <option value={0}  >Level 0</option>

//               </select>
//               <button
//                 type="submit"
//                 className="bg-red-400 text-white px-4 py-2 rounded"
//               >
//                 Add User
//               </button>
//             </form>

//             <div className="overflow-x-auto mt-4">
//               <table className="w-full border">
//                 <thead>
//                   <tr className="bg-blue-300">
//                     <th className="p-2">Name</th>
//                     <th className="p-2">Email</th>
//                     <th className="p-2">Role</th>
//                     <th className="p-2">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredUsers.map((u) => (
//                     <tr key={u._id} className="border-t">
//                       <td className="p-2">{u.name}</td>
//                       <td className="p-2">{u.email}</td>
//                       <td className="p-2">{roleLabels[u.role]}</td>
//                       <td className="p-2">
//                         <select
//                           className="border-gray-500 p-1 rounded bg-gray-500 text-white "
//                           value={u.role}
//                           onChange={(e) =>
//                             handleRoleChange(u._id, Number(e.target.value))
//                           }
//                         >
//                           <option value={2}>Level 2</option>
//                           <option value={1}>Level 1</option>
//                           <option value={0}>Level 0</option>
//                         </select>
//                         <button
//                           className="ml-2 text-red-600 hover:underline"
//                           onClick={() => handleDeleteUser(u._id)}
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

import { useEffect, useState } from "react";
import TopNavbar from "../components/TopNavbar";
import { Moon, Sun } from "lucide-react";
const roleLabels = { 0: "Level 0", 1: "Level 1", 2: "Level 2" };

export default function AdminDashboard() {
  const [darkMode, setDarkMode] = useState(false);

  const [stats, setStats] = useState({
    users: 0,
    topics: 0,
    topicsMonth: 0,
    commentsToday: 0,
  });

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userSuggestions, setUserSuggestions] = useState([]);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: 2,
  });
  const [addUserError, setAddUserError] = useState("");

  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [requestSearch, setRequestSearch] = useState("");
  const [requestSuggestions, setRequestSuggestions] = useState([]);
  const [message, setMessage] = useState("");


  // ---------------- FETCH STATS + USERS ----------------
  useEffect(() => {
    fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setStats(data));

    fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || []);
        setFilteredUsers(data.users || []);
      });
  }, []);

  // ---------------- USER SEARCH FILTER ----------------
  useEffect(() => {
    if (!userSearch) {
      setFilteredUsers(users);
      setUserSuggestions([]);
    } else {
      const search = userSearch.toLowerCase();
      const filtered = users.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      );
      setFilteredUsers(filtered);
      setUserSuggestions(filtered.slice(0, 5));
    }
  }, [userSearch, users]);

  // ---------------- ADD USER ----------------
  const handleAddUser = async (e) => {
    e.preventDefault();
    // Validation
    if (!newUser.name || !newUser.email || !newUser.password) {
      setAddUserError("All fields are required.");
      return;
    }
    // Simple email format check
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newUser.email)) {
      setAddUserError("Please enter a valid email address.");
      return;
    }
    setAddUserError("");
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(newUser),
    });
    const data = await response.json();
    if (!response.ok) {
      setAddUserError(data.message || "Failed to add user.");
      return;
    }
    setNewUser({ name: "", email: "", password: "", role: 2 });
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const usersData = await res.json();
    setUsers(usersData.users || []);
  };

  // ---------------- FETCH REQUESTS ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/register-requests", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setRequests(data.requests || []);
        setFilteredRequests(data.requests || []);
      });
  }, [message]);

  // ---------------- REQUEST SEARCH ----------------
  useEffect(() => {
    if (!requestSearch) {
      setFilteredRequests(requests);
      setRequestSuggestions([]);
    } else {
      const search = requestSearch.toLowerCase();
      const filtered = requests.filter(
        (r) =>
          r.name.toLowerCase().includes(search) ||
          r.email.toLowerCase().includes(search)
      );
      setFilteredRequests(filtered);
      setRequestSuggestions(filtered.slice(0, 5));
    }
  }, [requestSearch, requests]);

  // ---------------- APPROVE / REJECT REQUEST ----------------
  const handleAction = async (id, action) => {
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/register-requests/${id}/${action}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setMessage(data.message);
    } catch {
      setMessage("Action failed");
    }
  };

  // ---------------- CHANGE ROLE ----------------
  const handleRoleChange = async (id, role) => {
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/register-requests/${id}/role`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role }),
        }
      );
      const data = await res.json();
      setMessage(data.message);
    } catch {
      setMessage("Role update failed");
    }
  };
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Remove user from UI
        setUsers(users => users.filter(u => u._id !== userId));
        alert("User deleted successfully.");
      } else {
        alert(data.message || "Failed to delete user.");
      }
    } catch (err) {
      alert("Server error.");
    }
  };
  // ---------------- THEME CLASSES ----------------
  const pageBG = darkMode
    ? "bg-[#121314] text-gray-200"
    : "bg-gray-100 text-gray-700";

  const cardBG = darkMode
    ? "bg-[#1b1d1f] text-gray-300"
    : "bg-white text-gray-700";

  return (
    <>
      <TopNavbar />

      <div className={`${pageBG} min-h-screen px-4 py-6 pb-20`}>
        {/* ---------- HEADER WITH DARK MODE BUTTON ---------- */}
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
        <div className="max-w-5xl mx-auto flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>



        </div>


        <div className="max-w-5xl mx-auto space-y-10">
          {/* ---------------- SYSTEM DASHBOARD ---------------- */}
          <div className={`${cardBG} p-6 rounded-lg shadow`}>
            <h2 className="text-xl font-semibold mb-4">System Dashboard</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`${cardBG} p-4 rounded shadow bg-gray-600`}>
                <svg width="22" height="22" fill="currentColor">
                  <path d="M11 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10c4.4 
   0 8 2.2 8 5v3H3v-3c0-2.8 3.6-5 8-5z"/>
                </svg>

                <p>Total Users</p>
                <h3 className="text-2xl font-bold">{stats.users}</h3>
              </div>

              <div className={`${cardBG} p-4 rounded shadow bg-gray-600`}>
                <svg width="20" height="20" fill="currentColor">
                  <path d="M4 2h8l4 4v10a2 2 0 0 1-2 2H4a2 
  2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V6h3.5L12 
  3.5z"/>
                </svg>

                <p>Total Documents</p>
                <h3 className="text-2xl font-bold">{stats.topics}</h3>
              </div>

              <div className={`${cardBG} p-4 rounded shadow bg-gray-600`}>
                <svg width="20" height="20" fill="currentColor">
                  <path d="M3 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 
 2v8a2 2 0 0 1-2 2H7l-4 3V4z"/>
                </svg>

                <p>Topics This Month</p>
                <h3 className="text-2xl font-bold">{stats.topicsMonth}</h3>
              </div>

              <div className={`${cardBG} p-4 rounded shadow bg-gray-600`}>
                <svg width="20" height="20" fill="currentColor">
                  <path d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 
 1 2 2v6a2 2 0 0 1-2 2H6l-4 3V4zm10 2h4a2 2 
 0 0 1 2 2v6l-3-2h-3a2 2 0 0 1-2-2v-2"/>
                </svg>


                <p>Comments Today</p>
                <h3 className="text-2xl font-bold">{stats.commentsToday}</h3>
              </div>
            </div>
          </div>

          {/* ---------------- REGISTRATION REQUESTS ---------------- */}
          <div className={`${cardBG} p-6 rounded-lg shadow`}>
            <h2 className="text-xl font-semibold mb-4">
              Registration Requests
            </h2>

            <input
              type="text"
              className="border-gray-500 p-2 rounded w-full mb-2 bg-gray-500 text-white placeholder:text-white"
              placeholder="Search registrations..."
              value={requestSearch}
              onChange={(e) => setRequestSearch(e.target.value)}
            />

            {requestSuggestions.length > 0 && (
              <div className="bg-white border rounded shadow max-h-32 overflow-y-auto absolute z-10 w-[30%] content-center  ">
                {requestSuggestions.map((r) => (
                  <div
                    key={r._id}
                    className="px-3 py-1 cursor-pointer hover:bg-blue-300"
                    onClick={() => {
                      setRequestSearch(r.name);
                      setFilteredRequests([r]);
                      setRequestSuggestions([]);
                    }}
                  >
                    {r.name} <span className="text-black">({r.email})</span>
                  </div>
                ))}
              </div>
            )}

            <div className="overflow-x-auto mt-4">
              <table className="w-full border">
                <thead>
                  <tr className="bg-blue-300">
                    <th className="p-2">Name</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((r) => (
                    <tr key={r._id} className="border-t">
                      <td className="p-2">{r.name}</td>
                      <td className="p-2">{r.email}</td>
                      <td className="p-2">
                        {r.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleAction(r._id, "approve")}
                              className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(r._id, "reject")}
                              className="bg-red-600 text-white px-2 py-1 rounded"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {r.status === "approved" && (
                          <span className="text-green-600 font-semibold">
                            Approved
                          </span>
                        )}

                        {r.status === "rejected" && (
                          <span className="text-red-600 font-semibold">
                            Rejected
                          </span>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ---------------- USER MANAGEMENT ---------------- */}
          <div className={`${cardBG} p-6 rounded-lg shadow`}>
            <h2 className="text-xl font-semibold mb-4">User Management</h2>

            <input
              type="text"
              className="border-gray-500 p-2 rounded w-full mb-2 bg-gray-500 text-white placeholder:text-white"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />

            {userSuggestions.length > 0 && (
              <div className="bg-white border rounded shadow max-h-32 overflow-y-auto absolute z-10 w-[30%]">
                {userSuggestions.map((u) => (
                  <div
                    key={u._id}
                    className="px-3 py-1 cursor-pointer hover:bg-blue-300"
                    onClick={() => {
                      setUserSearch(u.name);
                      setFilteredUsers([u]);
                      setUserSuggestions([]);
                    }}
                  >
                    {u.name} <span className="text-black">({u.email})</span>
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={handleAddUser}
              className="flex flex-wrap gap-2 mt-4"
            >
              <input
                type="text"
                placeholder="Name"
                className="border-gray-500 p-2 rounded flex-1 bg-gray-500 placeholder:text-white text-white"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <input
                type="email"
                placeholder="Email"
                className="border-gray-500 p-2 rounded flex-1 bg-gray-500 placeholder:text-white text-white"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, email: e.target.value }))
                }
              />
              <input
                type="password"
                placeholder="Password"
                className="border-gray-500 p-2 rounded flex-1 bg-gray-500 placeholder:text-white text-white"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, password: e.target.value }))
                }
              />
              <select
                className="border-gray-500 p-2 rounded bg-gray-500 text-white"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser((prev) => ({
                    ...prev,
                    role: Number(e.target.value),
                  }))
                }
              >

                <option value={2}  >Level 2</option>
                <option value={1}  >Level 1</option>
                <option value={0}  >Level 0</option>

              </select>

              <button
                type="submit"
                className="bg-red-500 text-white px-4 py-2 rounded font-bold shadow-lg border-2 border-red-700 hover:bg-red-600 transition"
                style={{ boxShadow: "0 0 8px 2px #f87171" }}
              >
                Add User
              </button>
            </form>

            {/* Validation Error Messages */}
            {addUserError && (
              <div className="text-red-600 mt-2 font-semibold">
                {addUserError}
              </div>
            )}

            <div className="overflow-x-auto mt-4">
              <table className="w-full border">
                <thead>
                  <tr className="bg-blue-300">
                    <th className="p-2">Name</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Role</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="border-t">
                      <td className="p-2">{u.name}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2">{roleLabels[u.role]}</td>
                      <td className="p-2">
                        <select
                          className="border-gray-500 p-1 rounded bg-gray-500 text-white "
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(u._id, Number(e.target.value))
                          }
                        >
                          <option value={2}>Level 2</option>
                          <option value={1}>Level 1</option>
                          <option value={0}>Level 0</option>
                        </select>
                        <button
                          className="ml-2 text-red-600 hover:underline"
                          onClick={() => handleDeleteUser(u._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}