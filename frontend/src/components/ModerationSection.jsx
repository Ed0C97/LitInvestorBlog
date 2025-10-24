// LitInvestorBlog-frontend/src/components/ModerationSection.jsx

import React, { useState, useEffect } from 'react';
import UserAvatar from './ui/UserAvatar';
import { 
  Shield, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronDown,
  ChevronUp,
  Search,
  Eye
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import UserActivityLog from './UserActivityLog';
import AdminFilterPanel from './AdminFilterPanel';

const ModerationSection = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActivityLog, setShowActivityLog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('🔍 Fetching users from /api/moderation/users');
      const response = await fetch('/api/moderation/users', {
        credentials: 'include',
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Users data received:', data);
        console.log('👥 Number of users:', data.users?.length);
        setUsers(data.users || []);
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedAndFilteredUsers = () => {
    let filtered = [...users];

    // Filtro per ricerca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.first_name?.toLowerCase().includes(query) ||
        user.last_name?.toLowerCase().includes(query)
      );
    }

    // Filtro per ruolo
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Ordinamento
    if (!sortConfig.key) return filtered;

    const sorted = filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'username':
          aValue = (a.username || '').toLowerCase();
          bValue = (b.username || '').toLowerCase();
          break;
        case 'email':
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
          break;
        case 'reports':
          aValue = a.reports_count || 0;
          bValue = b.reports_count || 0;
          break;
        case 'role':
          aValue = a.role || '';
          bValue = b.role || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-[0.875rem] h-[0.875rem] opacity-50" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-[0.875rem] h-[0.875rem]" />
      : <ArrowDown className="w-[0.875rem] h-[0.875rem]" />;
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'author':
        return 'default';
      case 'user':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowActivityLog(true);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-[1rem]">
          <div className="h-[2rem] bg-gray/20 rounded w-[60%]"></div>
          <div className="space-y-[0.5rem]">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-[3.5rem] bg-gray/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full space-y-[2rem]">
        {/* Header con titolo e toggle collapse */}
        <div className="flex items-center justify-between">
          <button
            className="flex items-center gap-[0.75rem] cursor-pointer select-none hover:opacity-80 transition-opacity"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <Shield className="w-[1.5rem] h-[1.5rem] text-blue flex-shrink-0" />
            <h3 className="text-xl sm:text-2xl font-bold text-dark">
              User Moderation
            </h3>
            {isCollapsed ? (
              <ChevronDown className="w-[1.5rem] h-[1.5rem] text-gray transition-all duration-300 ease-in-out" />
            ) : (
              <ChevronUp className="w-[1.5rem] h-[1.5rem] text-gray transition-all duration-300 ease-in-out" />
            )}
          </button>

          <Badge variant="outline">
            {users.length} {users.length === 1 ? 'user' : 'users'}
          </Badge>
        </div>

        {/* Filtri e ricerca - Collapsabile */}
        <div
          className={`transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden ${
            isCollapsed 
              ? 'max-h-0 opacity-0 blur-sm' 
              : 'max-h-[2000px] opacity-100 blur-0'
          }`}
        >
          <AdminFilterPanel title="Filter Users">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-[0.75rem] top-1/2 transform -translate-y-1/2 text-gray w-[1rem] h-[1rem]" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-[2.5rem]"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-input-gray rounded-md bg-white text-dark focus:outline-none focus:ring-2 focus:ring-blue w-full sm:w-auto"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="author">Author</option>
              <option value="user">User</option>
            </select>
          </AdminFilterPanel>

          {/* Tabella utenti */}
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-input-gray bg-light-gray/30">
                  <th
                    className="text-left py-[1rem] px-[0.75rem] text-sm font-semibold text-gray uppercase tracking-wider cursor-pointer hover:text-dark transition-colors select-none"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-[0.5rem]">
                      <span>Joined</span>
                      {getSortIcon('created_at')}
                    </div>
                  </th>
                  <th
                    className="text-left py-[1rem] px-[0.75rem] text-sm font-semibold text-gray uppercase tracking-wider cursor-pointer hover:text-dark transition-colors select-none"
                    onClick={() => handleSort('username')}
                  >
                    <div className="flex items-center gap-[0.5rem]">
                      <span>User</span>
                      {getSortIcon('username')}
                    </div>
                  </th>
                  <th
                    className="text-left py-[1rem] px-[0.75rem] text-sm font-semibold text-gray uppercase tracking-wider cursor-pointer hover:text-dark transition-colors select-none hidden lg:table-cell"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center gap-[0.5rem]">
                      <span>Email</span>
                      {getSortIcon('email')}
                    </div>
                  </th>
                  <th
                    className="text-left py-[1rem] px-[0.75rem] text-sm font-semibold text-gray uppercase tracking-wider cursor-pointer hover:text-dark transition-colors select-none"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center gap-[0.5rem]">
                      <span>Role</span>
                      {getSortIcon('role')}
                    </div>
                  </th>
                  <th
                    className="text-center py-[1rem] px-[0.75rem] text-sm font-semibold text-gray uppercase tracking-wider cursor-pointer hover:text-dark transition-colors select-none"
                    onClick={() => handleSort('reports')}
                  >
                    <div className="flex items-center justify-center gap-[0.5rem]">
                      <span>Reports</span>
                      {getSortIcon('reports')}
                    </div>
                  </th>
                  <th className="text-center py-[1rem] px-[0.75rem] text-sm font-semibold text-gray uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-input-gray">
                {getSortedAndFilteredUsers().length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-[3rem] text-gray">
                      No users found
                    </td>
                  </tr>
                ) : (
                  getSortedAndFilteredUsers().map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-light-gray/30 transition-colors"
                    >
                      {/* Data creazione */}
                      <td className="py-[1rem] px-[0.75rem] text-dark text-sm">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      {/* User con Avatar */}
                      <td className="py-[1rem] px-[0.75rem]">
                        <div className="flex items-center gap-[0.75rem]">
                          <UserAvatar
                            username={user.username}
                            first_name={user.first_name}
                            imageUrl={user.avatar_url}
                            size={32}
                            className="flex-shrink-0"
                          />
                          <div className="flex flex-col">
                            <span className="text-dark font-medium truncate max-w-[8rem] sm:max-w-[12rem]">
                              {user.username}
                            </span>
                            <span className="text-gray text-xs truncate max-w-[8rem] sm:max-w-[12rem]">
                              {user.first_name} {user.last_name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email - nascosto su mobile */}
                      <td className="py-[1rem] px-[0.75rem] text-gray text-sm hidden lg:table-cell">
                        <div className="max-w-[15rem] truncate">
                          {user.email}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-[1rem] px-[0.75rem]">
                        <Badge
                          variant={getRoleBadgeVariant(user.role)}
                          className="capitalize"
                        >
                          {user.role}
                        </Badge>
                      </td>

                      {/* Reports Count */}
                      <td className="py-[1rem] px-[0.75rem] text-center">
                        <span className={user.reports_count > 0 ? "text-red font-semibold" : "text-gray"}>
                          {user.reports_count}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-[1rem] px-[0.75rem]">
                        <div className="flex items-center justify-center gap-[0.5rem]">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                            title="View activity"
                          >
                            <Eye className="w-[1rem] h-[1rem]" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Activity Log */}
      {showActivityLog && selectedUser && (
        <UserActivityLog
          user={selectedUser}
          onClose={() => {
            setShowActivityLog(false);
            setSelectedUser(null);
            fetchUsers(); // Refresh per aggiornare i conteggi
          }}
        />
      )}
    </>
  );
};

export default ModerationSection;
