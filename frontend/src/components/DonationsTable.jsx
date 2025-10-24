// LitInvestorBlog-frontend/src/components/DonationsTable.jsx

import React, { useState, useEffect } from 'react';
import UserAvatar from './ui/UserAvatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card} from './ui/card';
import Pagination from './ui/pagination';
import Modal from './Modal';
import {
  Users, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronDown, 
  ChevronUp, 
  Rocket,
  Search,
  Download,
  DollarSign,
  TrendingUp,
  Award,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * MessageModal - Popup per mostrare il messaggio completo
 */
const MessageModal = ({ message, onClose }) => (
  <Modal
    isOpen={true}
    onClose={onClose}
    className="max-w-[600px] w-full p-[2rem] relative"
  >
    <button
      onClick={onClose}
      className="absolute top-[1rem] right-[1rem] text-gray hover:text-antracite transition-colors"
    >
      <X className="w-[1.5rem] h-[1.5rem]" />
    </button>
    <h3 className="text-xl font-bold text-antracite mb-[1rem]">Donation Message</h3>
    <p className="text-antracite whitespace-pre-wrap break-words">
      {message || 'No message provided'}
    </p>
  </Modal>
);

/**
 * DonationsTable - Componente unificato per mostrare donazioni
 * 
 * @param {string} variant - 'public' (donate page) o 'admin' (dashboard)
 * @param {boolean} collapsible - Se la tabella può essere collassata (default: false)
 * @param {number} limit - Numero massimo di righe da mostrare (0 = tutte con pagination)
 */
const DonationsTable = ({ 
  variant = 'public', 
  collapsible = false,
  limit = 0 
}) => {
  const isAdmin = variant === 'admin';
  const isPaginated = limit === 0 && isAdmin;
  const itemsPerPage = 20;

  const [donations, setDonations] = useState([]);
  const [allDonations, setAllDonations] = useState([]);
  const [totalDonors, setTotalDonors] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: isAdmin ? 'created_at' : 'id', direction: 'desc' });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchDonations();
    if (isAdmin) {
      fetchStats();
    }
    
    // Poll per aggiornamenti real-time solo in public variant
    if (!isAdmin) {
      const interval = setInterval(fetchDonations, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const fetchDonations = async () => {
    try {
      const endpoint = isAdmin 
        ? '/api/donations/list?per_page=1000'
        : `/api/donations/recent?limit=${limit || 50}`;
      
      const response = await fetch(endpoint, {
        credentials: isAdmin ? 'include' : 'same-origin',
      });
      
      if (response.ok) {
        const data = await response.json();
        const donationsData = data.donations || [];
        setAllDonations(donationsData);
        setDonations(donationsData);
        setTotalDonors(data.total_donors || donationsData.length);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
      if (isAdmin) toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/donations/stats', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/donations/export?format=csv', {
        credentials: 'include',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `donations_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Export completed');
      } else {
        toast.error('Export failed');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Export error');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getSortedAndFilteredDonations = () => {
    let filtered = [...allDonations];

    // Search (admin only)
    if (isAdmin && searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (donation) =>
          donation.donor_name?.toLowerCase().includes(query) ||
          donation.donor_email?.toLowerCase().includes(query) ||
          donation.message?.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case 'id':
            aValue = a.id;
            bValue = b.id;
            break;
          case 'created_at':
            aValue = new Date(a.created_at);
            bValue = new Date(b.created_at);
            break;
          case 'donor':
          case 'donor_name':
            aValue = (a.anonymous || !a.donor_name ? 'Anonymous' : a.donor_name).toLowerCase();
            bValue = (b.anonymous || !b.donor_name ? 'Anonymous' : b.donor_name).toLowerCase();
            break;
          case 'amount':
            aValue = parseFloat(a.amount);
            bValue = parseFloat(b.amount);
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
    }

    return filtered;
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-[0.875rem] h-[0.875rem] opacity-50" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-[0.875rem] h-[0.875rem]" />
      : <ArrowDown className="w-[0.875rem] h-[0.875rem]" />;
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return isAdmin ? '-' : '—';
    return message.length > maxLength
      ? `${message.substring(0, maxLength)}...`
      : message;
  };

  // Pagination
  const sortedAndFiltered = getSortedAndFilteredDonations();
  const totalPages = isPaginated ? Math.ceil(sortedAndFiltered.length / itemsPerPage) : 1;
  const startIndex = isPaginated ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = isPaginated ? startIndex + itemsPerPage : (limit || sortedAndFiltered.length);
  const displayDonations = sortedAndFiltered.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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

  const tableContent = (
    <>
      {/* Admin: Stats Cards */}
      {isAdmin && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[0.75rem] mb-[2rem]">
          <Card className="shadow-none border-none overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray">Total Donations</p>
                  <p className="text-2xl font-bold text-antracite">
                    €{stats.total_amount.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-[2rem] h-[2rem] text-green" />
              </div>
            </div>
          </Card>

          <Card className="shadow-none border-none overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray">Total Donors</p>
                  <p className="text-2xl font-bold text-antracite">
                    {stats.total_donations}
                  </p>
                </div>
                <Users className="w-[2rem] h-[2rem] text-blue" />
              </div>
            </div>
          </Card>

          <Card className="shadow-none border-none overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray">This Month</p>
                  <p className="text-2xl font-bold text-antracite">
                    €{stats.this_month_amount.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="w-[2rem] h-[2rem] text-yellow" />
              </div>
            </div>
          </Card>

          <Card className="shadow-none border-none overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray">Highest Donation</p>
                  <p className="text-2xl font-bold text-antracite">
                    €{stats.max_donation.toFixed(2)}
                  </p>
                </div>
                <Award className="w-[2rem] h-[2rem] text-red" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Admin: Search & Export */}
      {isAdmin && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[1rem] mb-[2rem]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-[0.75rem] top-1/2 transform -translate-y-1/2 text-gray w-[1rem] h-[1rem]" />
            <Input
              placeholder="Search donations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-[2.5rem]"
            />
          </div>
          <Button variant="outline" onClick={handleExport} size="sm">
            <Download className="w-[1rem] h-[1rem] mr-[0.5rem]" />
            Export CSV
          </Button>
        </div>
      )}

      {/* Table - Scroll orizzontale SOLO su mobile */}
      <div className="w-full text-sm overflow-x-auto md:overflow-x-visible">
        <table className="w-full border-collapse table-fixed min-w-[600px] md:min-w-0">
          <colgroup>
            {!isAdmin && <col style={{ width: '60px' }} />}
            {isAdmin && <col style={{ width: '140px' }} />}
            <col style={{ width: isAdmin ? '200px' : '180px' }} />
            {isAdmin && <col style={{ width: '250px' }} />}
            <col style={{ width: '250px' }} />
            <col style={{ width: '120px' }} />
          </colgroup>
          <thead>
            <tr className={`border-b border-input-gray ${isAdmin ? 'bg-light-gray/30' : 'bg-white-glass'}`}>
              {/* Public: # column */}
              {!isAdmin && (
                <th 
                  className={`text-left py-[1rem] px-[0.75rem] text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors select-none ${
                    isAdmin ? 'text-gray hover:text-antracite' : 'text-gray hover:text-white'
                  }`}
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-[0.5rem]">
                    <span>#</span>
                    {getSortIcon('id')}
                  </div>
                </th>
              )}

              {/* Admin: Date column */}
              {isAdmin && (
                <th 
                  className="text-left py-[1rem] px-[0.75rem] text-xs font-semibold text-gray uppercase tracking-wider cursor-pointer hover:text-antracite transition-colors select-none"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-[0.5rem]">
                    <span>Date</span>
                    {getSortIcon('created_at')}
                  </div>
                </th>
              )}

              {/* Donor column */}
              <th 
                className={`text-left py-[1rem] px-[0.75rem] text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors select-none ${
                  isAdmin ? 'text-gray hover:text-antracite' : 'text-gray hover:text-white'
                }`}
                onClick={() => handleSort(isAdmin ? 'donor_name' : 'donor')}
              >
                <div className="flex items-center gap-[0.5rem]">
                  <span>Donor</span>
                  {getSortIcon(isAdmin ? 'donor_name' : 'donor')}
                </div>
              </th>

              {/* Admin: Email column */}
              {isAdmin && (
                <th className="text-left py-[1rem] px-[0.75rem] text-xs font-semibold text-gray uppercase tracking-wider">
                  Email
                </th>
              )}

              {/* Message column */}
              <th className={`text-left py-[1rem] px-[0.75rem] text-xs font-semibold uppercase tracking-wider transition-colors ${
                isAdmin ? 'text-gray' : 'text-gray hover:text-white'
              }`}>
                Message
              </th>

              {/* Amount column */}
              <th 
                className={`text-right py-[1rem] px-[0.75rem] text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors select-none ${
                  isAdmin ? 'text-gray hover:text-antracite' : 'text-gray hover:text-white'
                }`}
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end gap-[0.5rem]">
                  <span>Amount</span>
                  {getSortIcon('amount')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-input-gray">
            {displayDonations.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className={`text-center py-[3rem] ${isAdmin ? 'text-gray' : 'text-gray'}`}>
                  {searchQuery ? 'No donations found matching your search' : 'No donations yet. Be the first!'}
                </td>
              </tr>
            ) : (
              <>
                {displayDonations.map((donation) => {
                  // PUBLIC: Rispetta privacy - mostra "Anonymous" se anonymous=true
                  //         Altrimenti mostra donor_name (può essere username o nome inserito dall'utente)
                  // ADMIN: Mostra SEMPRE donor_name (nome completo) - MAI "Anonymous"
                  //        Gli admin devono sempre vedere chi ha donato per ringraziamenti
                  const displayName = isAdmin 
                    ? (donation.donor_name || 'N/A')  // Admin vede sempre il nome reale
                    : (donation.anonymous ? 'Anonymous' : (donation.donor_name || 'Anonymous')); // Public rispetta privacy
                  
                  const isAnonymous = !isAdmin && (donation.anonymous || !donation.donor_name);

                  return (
                    <tr 
                      key={donation.id} 
                      className={`transition-colors ${isAdmin ? 'hover:bg-light-gray/30' : 'hover:bg-gray/5'}`}
                    >
                      {/* Public: ID */}
                      {!isAdmin && (
                        <td className={`py-[1rem] px-[0.75rem] font-medium ${isAdmin ? 'text-antracite' : 'text-white'}`}>
                          {donation.id}
                        </td>
                      )}

                      {/* Admin: Date & Time */}
                      {isAdmin && (
                        <td className="py-[0.875rem] px-[0.75rem] text-antracite text-xs">
                          <div className="flex items-center gap-[0.5rem]">
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {new Date(donation.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </div>
                              <div className="text-xs text-gray">
                                {new Date(donation.created_at).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Donor with Avatar */}
                      <td className="py-[0.875rem] px-[0.75rem]">
                        <div className="flex items-center gap-[0.75rem] min-w-0">
                          <UserAvatar
                            username={isAnonymous ? 'Anonymous' : displayName}
                            first_name={isAnonymous ? 'A' : undefined}
                            imageUrl={isAnonymous ? null : donation.avatar_url}
                            size={28}
                            className="flex-shrink-0"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className={`font-medium text-sm truncate ${
                              isAdmin ? 'text-antracite' : 'text-white'
                            }`}>
                              {/* Admin mostra SEMPRE il nome reale, mai "Anonymous" */}
                              {/* Public mostra "Anonymous" se anonymous=true */}
                              {displayName}
                            </span>
                            {/* Data di creazione sotto il nome */}
                            <span className="text-xs text-gray">
                              {new Date(donation.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Admin: Email */}
                      {isAdmin && (
                        <td className="py-[0.875rem] px-[0.75rem] text-gray text-xs">
                          {/* Admin vede sempre l'email, anche se donation.anonymous = true */}
                          <div className="truncate">
                            {donation.donor_email || '-'}
                          </div>
                        </td>
                      )}

                      {/* Message - Clickable with truncation */}
                      <td className={`py-[0.875rem] px-[0.75rem] text-xs ${
                        isAdmin ? 'text-gray' : 'text-gray'
                      }`}>
                        {donation.message ? (
                          <div 
                            className="truncate cursor-pointer hover:text-antracite transition-colors"
                            onClick={() => setSelectedMessage(donation.message)}
                            title="Click to view full message"
                          >
                            {truncateMessage(donation.message, isAdmin ? 40 : 60)}
                          </div>
                        ) : (
                          <span className="italic">{isAdmin ? '-' : '—'}</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-[0.875rem] px-[0.75rem] text-right">
                        <span className={`font-bold text-base ${isAdmin ? 'text-green' : 'text-yellow'}`}>
                          €{parseFloat(donation.amount).toFixed(2)}
                        </span>
                        {isAdmin && (
                          <span className="text-xs text-gray ml-[0.25rem]">
                            {donation.currency}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* Public: "..." row se ci sono più donazioni */}
                {!isAdmin && limit > 0 && totalDonors > limit && (
                  <tr className="border-t-2 border-input-gray">
                    <td className="py-[1rem] px-[0.75rem] text-center text-gray text-xl font-bold">⋯</td>
                    <td className="py-[1rem] px-[0.75rem] text-center text-gray text-xl font-bold">⋯</td>
                    <td className="py-[1rem] px-[0.75rem] text-center text-gray text-xl font-bold">⋯</td>
                    <td className="py-[1rem] px-[0.75rem] text-center text-gray text-xl font-bold">⋯</td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Admin: Summary & Pagination - CENTRATO */}
      {isAdmin && (
        <div className="flex flex-col items-center gap-[1rem] mt-[2rem]">
          <span className="text-sm text-gray">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedAndFiltered.length)} of {sortedAndFiltered.length} donations
            {stats && ` • Average: €${stats.average_amount.toFixed(2)}`}
          </span>
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}

      {/* Public: Messaggio incoraggiante */}
      {!isAdmin && !isCollapsed && displayDonations.length > 0 && (
        <p className="flex items-center justify-center gap-2 text-center text-sm text-gray italic mt-[1.5rem]">
          <span>Thank you to all our generous supporters!</span>
          <Rocket className="w-4 h-4 text-gray" />
        </p>
      )}
    </>
  );

  // Public with collapsible
  if (!isAdmin && collapsible) {
    return (
      <div className="w-full space-y-[2rem]">
        <div 
          className="flex items-center gap-[0.75rem] cursor-pointer select-none hover:opacity-80 transition-opacity"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Users className="w-[1.5rem] h-[1.5rem] text-white flex-shrink-0" />
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Join {totalDonors} {totalDonors === 1 ? 'donor' : 'donors'}
          </h3>
          {isCollapsed ? (
            <ChevronDown className="w-[1.5rem] h-[1.5rem] text-white transition-all duration-300 ease-in-out" />
          ) : (
            <ChevronUp className="w-[1.5rem] h-[1.5rem] text-white transition-all duration-300 ease-in-out" />
          )}
        </div>

        <div 
          className={`transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden relative z-20 ${
            isCollapsed 
              ? 'max-h-0 opacity-0 blur-sm' 
              : 'max-h-[2000px] opacity-100 blur-0'
          }`}
        >
          {tableContent}
        </div>
      </div>
    );
  }

  // Admin or Public without collapsible
  return (
    <div className="w-full">
      {tableContent}
      
      {/* Message Modal */}
      {selectedMessage && (
        <MessageModal 
          message={selectedMessage} 
          onClose={() => setSelectedMessage(null)} 
        />
      )}
    </div>
  );
};

export default DonationsTable;
