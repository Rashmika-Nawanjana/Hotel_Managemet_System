// app/admin/users/page.tsx
"use client";

import React, { useState } from "react";
type UserFormFields = Partial<
  User & {
    password?: string;
    dateOfBirth?: string;
    nationality?: string;
    phone?: string;
    idType?: string;
    idNumber?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    twoFactorEnabled?: boolean;
    twoFactorSecret?: string;
    emailVerified?: boolean;
  }
>;
function UserFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  isEdit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initial?: UserFormFields;
  isEdit?: boolean;
}) {
  const [form, setForm] = useState<UserFormFields>(initial || {});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when opening
  React.useEffect(() => {
    setForm(initial || {});
    setError("");
  }, [open, initial]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (
        !form.firstName ||
        !form.lastName ||
        !form.email ||
        (!isEdit && !form.password) ||
        !form.role ||
        !form.status ||
        !form.dateOfBirth ||
        !form.nationality ||
        !form.phone ||
        !form.idType ||
        !form.idNumber ||
        !form.address ||
        !form.city ||
        !form.postalCode
      ) {
        setError("All required fields must be filled.");
        setLoading(false);
        return;
      }
      await onSubmit(form);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <React.Fragment>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <form
          onSubmit={handleSubmit}
          className="bg-[#181d28] p-8 rounded-xl w-full max-w-md border border-gray-700 max-h-screen overflow-y-auto scrollbar-hide"
        >
          <h2 className="text-xl font-bold mb-4 text-white">
            {isEdit ? "Edit User" : "Add User"}
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              name="firstName"
              value={form.firstName || ""}
              onChange={handleChange}
              placeholder="First Name"
              className="p-2 rounded bg-[#10141c] border border-gray-700 text-white"
              required
            />
            <input
              name="lastName"
              value={form.lastName || ""}
              onChange={handleChange}
              placeholder="Last Name"
              className="p-2 rounded bg-[#10141c] border border-gray-700 text-white"
              required
            />
            <input
              name="email"
              value={form.email || ""}
              onChange={handleChange}
              placeholder="Email"
              className="col-span-2 p-2 rounded bg-[#10141c] border border-gray-700 text-white"
              required
            />
            {!isEdit && (
              <input
                name="password"
                type="password"
                value={form.password || ""}
                onChange={handleChange}
                placeholder="Password"
                className="col-span-2 p-2 rounded bg-[#10141c] border border-gray-700 text-white"
                required
              />
            )}
            <input
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
              placeholder="Phone"
              className="col-span-2 p-2 rounded bg-[#10141c] border border-gray-700 text-white"
              required
            />
            <input
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth || ""}
              onChange={handleChange}
              placeholder="Date of Birth"
              className="col-span-2 p-2 rounded bg-[#10141c] border border-gray-700 text-white"
              required
            />
            <input
              name="nationality"
              value={form.nationality || ""}
              onChange={handleChange}
              placeholder="Nationality"
              className="col-span-2 p-2 rounded bg-[#10141c] border border-gray-700 text-white"
              required
            />
            <select
              name="idType"
              value={form.idType || "NATIONAL_ID"}
              onChange={handleChange}
              className="col-span-2 p-2 rounded bg-[#10141c] border border-gray-700 text-white"
              required
            >
              <option value="">Select ID Type</option>
              <option value="NATIONAL_ID">National ID</option>
              <option value="PASSPORT">Passport</option>
              <option value="DRIVING_LICENSE">Driving License</option>
            </select>
            <input
              name="idNumber"
              value={form.idNumber || ""}
              onChange={handleChange}
              placeholder="ID Number"
              className="col-span-2 p-2 rounded bg-[#10141c] border border-gray-700 text-white"
              required
            />
            <input
              name="address"
              value={form.address || ""}
              onChange={handleChange}
              placeholder="Address"
              className="col-span-2 p-2 rounded bg-[#10141c] border border-gray-700 text-white"
              required
            />
            <input
              name="city"
              value={form.city || ""}
              onChange={handleChange}
              placeholder="City"
              className="col-span-2 p-2 rounded bg-[#10141c] border border-gray-700 text-white"
              required
            />
            <input
              name="postalCode"
              value={form.postalCode || ""}
              onChange={handleChange}
              placeholder="Postal Code"
              className="col-span-2 p-2 rounded bg-[#10141c] border border-gray-700 text-white"
              required
            />
            <label className="col-span-2 flex items-center gap-2 text-white text-sm">
              <input
                type="checkbox"
                name="twoFactorEnabled"
                checked={!!form.twoFactorEnabled}
                onChange={(e) =>
                  setForm((f) => ({ ...f, twoFactorEnabled: e.target.checked }))
                }
              />
              Two-Factor Enabled
            </label>
            <input
              name="twoFactorSecret"
              value={form.twoFactorSecret || ""}
              onChange={handleChange}
              placeholder="Two-Factor Secret (optional)"
              className="col-span-2 p-2 rounded bg-[#10141c] border border-gray-700 text-white"
            />
            <label className="col-span-2 flex items-center gap-2 text-white text-sm">
              <input
                type="checkbox"
                name="emailVerified"
                checked={!!form.emailVerified}
                onChange={(e) =>
                  setForm((f) => ({ ...f, emailVerified: e.target.checked }))
                }
              />
              Email Verified
            </label>
          </div>
          {error && <div className="text-red-400 mb-2">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-700 text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-amber-400 text-black font-semibold hover:bg-amber-500 disabled:opacity-50"
            >
              {loading ? "Saving..." : isEdit ? "Save" : "Add"}
            </button>
          </div>
          {/* ...rest of the form fields and buttons... */}
        </form>
      </div>
    </React.Fragment>
  );
}
function ConfirmModal({
  open,
  onClose,
  onConfirm,
  message,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#181d28] p-8 rounded-xl w-full max-w-sm border border-gray-700">
        <div className="mb-6 text-white">{message}</div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-700 text-white"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
import Link from "next/link";
import AdminSidebar from "@/app/components/AdminSidebar";
import {
  Search,
  UserPlus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

import { useEffect } from "react";

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
  lastLoginAt: string | null;
}

const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-[#181d28] border border-gray-800 rounded-xl ${className}`}
  >
    {children}
  </div>
);

const getStatusColor = (status: string) => {
  if (status === "active") return "bg-green-500/10 text-green-400";
  if (status === "inactive") return "bg-gray-500/10 text-gray-400";
  if (status === "suspended") return "bg-red-500/10 text-red-400";
  return "bg-gray-500/10 text-gray-400";
};

const getRoleBadge = (role: string) => {
  if (role === "admin") return "bg-red-500/10 text-red-400";
  if (role === "staff") return "bg-blue-500/10 text-blue-400";
  if (role === "guest") return "bg-purple-500/10 text-purple-400";
  return "bg-gray-500/10 text-gray-400";
};

export default function AdminUsersPage() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filterRole, setFilterRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  // Add user
  const handleAddUser = async (data: any) => {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add user");
    // Refresh users
    await fetchUsers();
  };

  // Edit user
  const handleEditUser = async (data: any) => {
    const res = await fetch(`/api/admin/users/${editUser?.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update user");
    setEditUser(null);
    await fetchUsers();
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    const res = await fetch(`/api/admin/users/${deleteUser.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete user");
    setDeleteUser(null);
    await fetchUsers();
  };

  // Fetch users (shared for reload)
  const fetchUsers = async (p: number = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users?page=${p}&limit=10`, { credentials: "include" });
      if (!res.ok) throw new Error("Unauthorized or failed to fetch users");
      const data = await res.json();
      setUsers(data.users || data.users === undefined ? data.users || data.users : data.users || data.users);
      setUsers(data.users || data.users || []);
      setTotal(data.total || 0);
      setPage(data.page || p);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };
  React.useEffect(() => {
    fetchUsers(page);
    // eslint-disable-next-line
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / 10));

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    fetchUsers(p);
  };

  const filteredUsers = users.filter(
    (user) =>
      (filterRole === "all" || user.role.toLowerCase() === filterRole) &&
      ((user.firstName + " " + user.lastName)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#10141c] text-gray-300 flex">
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
      <main
        className={`flex-1 p-8 overflow-y-auto transition-all duration-500 ease-in-out ${
          isSidebarCollapsed ? "pl-24" : "pl-72"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white font-l">
                User Management
              </h1>
              <p className="text-gray-400">
                Manage all system users including guests, staff, and
                administrators.
              </p>
            </div>
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-amber-400 text-black font-semibold rounded-md hover:bg-amber-500 transition-colors"
              onClick={() => setShowAdd(true)}
            >
              <UserPlus size={16} />
              <span>Add User</span>
            </button>
          </header>

          <Card>
            <div className="p-6 flex flex-wrap gap-4 items-center justify-between border-b border-gray-800">
              <div className="flex space-x-2 bg-[#10141c] p-1 rounded-md">
                <button
                  onClick={() => setFilterRole("all")}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    filterRole === "all"
                      ? "bg-amber-400 text-black"
                      : "text-gray-400"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterRole("guest")}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    filterRole === "guest"
                      ? "bg-amber-400 text-black"
                      : "text-gray-400"
                  }`}
                >
                  Guests
                </button>
                <button
                  onClick={() => setFilterRole("staff")}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    filterRole === "staff"
                      ? "bg-amber-400 text-black"
                      : "text-gray-400"
                  }`}
                >
                  Staff
                </button>
                <button
                  onClick={() => setFilterRole("admin")}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    filterRole === "admin"
                      ? "bg-amber-400 text-black"
                      : "text-gray-400"
                  }`}
                >
                  Admins
                </button>
              </div>
              <div className="relative w-full max-w-xs">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#10141c] border border-gray-700 rounded-md pl-10 pr-4 py-2 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 text-center text-gray-400">
                  Loading users...
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-400">{error}</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="border-b border-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-400">
                        User
                      </th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-400">
                        Role
                      </th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-400">
                        Status
                      </th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-400">
                        Last Login
                      </th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-white">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(
                              user.role.toLowerCase()
                            )}`}
                          >
                            {user.role.toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              user.status.toLowerCase()
                            )}`}
                          >
                            {user.status.toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {user.lastLoginAt
                            ? user.lastLoginAt.replace("T", " ").slice(0, 16)
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              className="p-2 text-gray-400 hover:text-amber-400"
                              onClick={() => setEditUser(user)}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="p-2 text-gray-400 hover:text-red-400"
                              onClick={() => setDeleteUser(user)}
                            >
                              <Trash2 size={16} />
                            </button>
                            <UserFormModal
                              open={showAdd}
                              onClose={() => setShowAdd(false)}
                              onSubmit={handleAddUser}
                              isEdit={false}
                            />
                            <UserFormModal
                              open={!!editUser}
                              onClose={() => setEditUser(null)}
                              onSubmit={handleEditUser}
                              initial={editUser || undefined}
                              isEdit={true}
                            />
                            <ConfirmModal
                              open={!!deleteUser}
                              onClose={() => setDeleteUser(null)}
                              onConfirm={handleDeleteUser}
                              message={`Are you sure you want to delete user "${deleteUser?.firstName} ${deleteUser?.lastName}"?`}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 px-6 py-3">
              <div className="text-sm text-gray-400">Page {page} of {total ? Math.max(1, Math.ceil(total / 10)) : 1}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1 bg-gray-800 text-gray-300 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= Math.max(1, Math.ceil(total / 10))}
                  className="px-3 py-1 bg-gray-800 text-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
