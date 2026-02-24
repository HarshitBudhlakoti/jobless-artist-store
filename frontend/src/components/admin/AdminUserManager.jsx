import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiUsers,
  FiMail,
  FiCalendar,
  FiShield,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiMapPin,
  FiPhone,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { debounce, getPaginationRange, getInitials } from '../../utils/helpers';

export default function AdminUserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(15);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (roleFilter) params.role = roleFilter;
      if (search.trim()) params.search = search;

      const { data } = await api.get('/auth/admin/users', { params });
      setUsers(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotal(data.pagination?.total || data.data?.length || 0);
    } catch (err) {
      // Endpoint may not exist yet - show mock data instructions
      if (err.status === 404) {
        setUsers([]);
        setTotal(0);
      } else {
        toast.error('Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce(() => {
      setPage(1);
      fetchUsers();
    }, 400),
    [roleFilter]
  );

  useEffect(() => {
    debouncedSearch();
  }, [search]);

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/auth/admin/users/${user._id}`, { role: newRole });
      toast.success(`${user.name} is now ${newRole}`);
      fetchUsers();
    } catch {
      toast.error('Failed to update user role');
    }
  };

  const pagination = getPaginationRange(page, totalPages);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A] font-['Playfair_Display']">Users</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5 font-['DM_Sans']">{total} registered users</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans'] bg-white min-w-[140px]"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-[#C75B39] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiUsers className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-[#6B6B6B] font-['DM_Sans']">No users found</p>
            <p className="text-xs text-[#6B6B6B] mt-1 font-['DM_Sans']">
              The admin users endpoint may not be available yet. Ensure GET /api/auth/admin/users is implemented.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">User</th>
                    <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Email</th>
                    <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Role</th>
                    <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Phone</th>
                    <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Joined</th>
                    <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user, idx) => (
                    <tr
                      key={user._id}
                      className={`hover:bg-gray-50/50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/30' : ''}`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#C75B39]/10 flex items-center justify-center flex-shrink-0">
                            {user.avatar ? (
                              <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                              <span className="text-sm font-semibold text-[#C75B39] font-['DM_Sans']">
                                {getInitials(user.name)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#1A1A1A] font-['DM_Sans']">{user.name}</p>
                            {user.googleId && (
                              <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-['DM_Sans']">
                                Google
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-[#6B6B6B] font-['DM_Sans']">
                        {user.email}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium font-['DM_Sans'] ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <FiShield className="w-3 h-3" />
                          {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-[#6B6B6B] font-['DM_Sans']">
                        {user.phone || '-'}
                      </td>
                      <td className="px-5 py-3 text-sm text-[#6B6B6B] font-['DM_Sans'] whitespace-nowrap">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedUser(selectedUser?._id === user._id ? null : user)}
                            className="p-1.5 text-[#6B6B6B] hover:text-[#C75B39] hover:bg-[#C75B39]/5 rounded-lg transition-colors"
                            title="View details"
                          >
                            <FiUser className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleRole(user)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors font-['DM_Sans'] ${
                              user.role === 'admin'
                                ? 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                                : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                            }`}
                          >
                            {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {users.map((user) => (
                <div key={user._id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C75B39]/10 flex items-center justify-center flex-shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <span className="text-sm font-semibold text-[#C75B39] font-['DM_Sans']">
                          {getInitials(user.name)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#1A1A1A] font-['DM_Sans']">{user.name}</p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium font-['DM_Sans'] ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B6B6B] mt-0.5 font-['DM_Sans']">{user.email}</p>
                      {user.phone && (
                        <p className="text-xs text-[#6B6B6B] font-['DM_Sans']">{user.phone}</p>
                      )}
                      <p className="text-xs text-[#6B6B6B] mt-1 font-['DM_Sans']">
                        Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleRole(user)}
                      className={`px-2 py-1 text-[10px] font-medium rounded-lg font-['DM_Sans'] flex-shrink-0 ${
                        user.role === 'admin'
                          ? 'text-gray-600 bg-gray-100'
                          : 'text-purple-700 bg-purple-50'
                      }`}
                    >
                      {user.role === 'admin' ? 'Revoke' : 'Promote'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* User detail expansion */}
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 bg-gray-50 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#1A1A1A] font-['DM_Sans']">
                User Details: {selectedUser.name}
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-xs text-[#6B6B6B] hover:text-[#1A1A1A] font-['DM_Sans']"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <FiMail className="w-4 h-4 text-[#6B6B6B]" />
                <span className="text-[#6B6B6B] font-['DM_Sans']">{selectedUser.email}</span>
              </div>
              {selectedUser.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <FiPhone className="w-4 h-4 text-[#6B6B6B]" />
                  <span className="text-[#6B6B6B] font-['DM_Sans']">{selectedUser.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <FiCalendar className="w-4 h-4 text-[#6B6B6B]" />
                <span className="text-[#6B6B6B] font-['DM_Sans']">
                  Joined {new Date(selectedUser.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {selectedUser.address && (selectedUser.address.city || selectedUser.address.state) && (
                <div className="flex items-start gap-2 text-sm sm:col-span-2">
                  <FiMapPin className="w-4 h-4 text-[#6B6B6B] mt-0.5" />
                  <span className="text-[#6B6B6B] font-['DM_Sans']">
                    {[
                      selectedUser.address.street,
                      selectedUser.address.city,
                      selectedUser.address.state,
                      selectedUser.address.zip,
                      selectedUser.address.country,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center px-4 py-3 border-t border-gray-100 gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 text-[#6B6B6B] hover:text-[#1A1A1A] disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            {pagination.map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="px-2 text-sm text-[#6B6B6B] font-['DM_Sans']">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors font-['DM_Sans'] ${
                    page === p
                      ? 'bg-[#C75B39] text-white'
                      : 'text-[#6B6B6B] hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 text-[#6B6B6B] hover:text-[#1A1A1A] disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
