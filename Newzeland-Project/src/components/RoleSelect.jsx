export default function RoleSelect({ value, onChange }) {
  return (
    <select name="role" value={value} onChange={onChange} className="w-full border p-2 rounded">
      <option value={2}>Field User</option>
      <option value={1}>Admin</option>
      <option value={0}>Super Admin</option>
    </select>
  );
}
