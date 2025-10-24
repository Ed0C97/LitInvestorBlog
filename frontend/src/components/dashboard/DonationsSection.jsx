// LitInvestorBlog-frontend/src/components/dashboard/DonationsSection.jsx

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Download,
  TrendingUp,
  Users,
  Calendar,
  Award,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import Pagination from '../ui/pagination';
import { toast } from 'sonner';

const DonationsSection = () => {
  const [donations, setDonations] = useState([]);
  const [allDonations, setAllDonations] = useState([]); // Store all donations for filtering
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchDonations();
    fetchStats();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await fetch('/api/donations/list?per_page=1000', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAllDonations(data.donations || []);
        setDonations(data.donations || []);
      } else {
        toast.error('Failed to load donations');
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Connection error');
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
    setCurrentPage(1); // Reset to first page on sort
  };

  const getSortedAndFilteredDonations = () => {
    let filtered = [...allDonations];

    // Filter by search
    if (searchQuery) {
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
          case 'created_at':
            aValue = new Date(a.created_at);
            bValue = new Date(b.created_at);
            break;
          case 'amount':
            aValue = a.amount || 0;
            bValue = b.amount || 0;
            break;
          case 'donor_name':
            aValue = (a.donor_name || 'Anonymous').toLowerCase();
            bValue = (b.donor_name || 'Anonymous').toLowerCase();
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
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-[0.875rem] h-[0.875rem]" />
    ) : (
      <ArrowDown className="w-[0.875rem] h-[0.875rem]" />
    );
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return '-';
    return message.length > maxLength
      ? `${message.substring(0, maxLength)}...`
      : message;
  };

  // Pagination logic
  const sortedAndFiltered = getSortedAndFilteredDonations();
  const totalPages = Math.ceil(sortedAndFiltered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDonations = sortedAndFiltered.slice(startIndex, endIndex);

  useEffect(() => {
    // Reset to page 1 when search query changes
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-[1rem]">
          <div className="h-[2rem] bg-gray/20 rounded w-[60%]"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[1rem]">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[6rem] bg-gray/10 rounded"></div>
            ))}
          </div>
          <div className="h-[20rem] bg-gray/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-[2rem]">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-[1.5rem]">
          <Card>
            <CardContent className="p-[1.5rem]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray">Total Donations</p>
                  <p className="text-2xl font-bold text-antracite">
                    €{stats.total_amount.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-[2rem] h-[2rem] text-green" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-[1.5rem]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray">Total Donors</p>
                  <p className="text-2xl font-bold text-antracite">
                    {stats.total_donations}
                  </p>
                </div>
                <Users className="w-[2rem] h-[2rem] text-blue" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-[1.5rem]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray">This Month</p>
                  <p className="text-2xl font-bold text-antracite">
                    €{stats.this_month_amount.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="w-[2rem] h-[2rem] text-yellow" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-[1.5rem]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray">Highest Donation</p>
                  <p className="text-2xl font-bold text-antracite">
                    €{stats.max_donation.toFixed(2)}
                  </p>
                </div>
                <Award className="w-[2rem] h-[2rem] text-red" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header with Search and Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[1rem]">
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

      {/* Donations Table */}
      <div className="w-full overflow-x-auto bg-white rounded-lg border border-input-gray">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-input-gray bg-light-gray/30">
              <th
                className="text-left py-[1rem] px-[0.75rem] text-sm font-semibold text-gray uppercase tracking-wider cursor-pointer hover:text-antracite transition-colors select-none"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-[0.5rem]">
                  <span>Date</span>
                  {getSortIcon('created_at')}
                </div>
              </th>
              <th
                className="text-left py-[1rem] px-[0.75rem] text-sm font-semibold text-gray uppercase tracking-wider cursor-pointer hover:text-antracite transition-colors select-none"
                onClick={() => handleSort('donor_name')}
              >
                <div className="flex items-center gap-[0.5rem]">
                  <span>Donor</span>
                  {getSortIcon('donor_name')}
                </div>
              </th>
              <th className="text-left py-[1rem] px-[0.75rem] text-sm font-semibold text-gray uppercase tracking-wider hidden lg:table-cell">
                Email
              </th>
              <th className="text-left py-[1rem] px-[0.75rem] text-sm font-semibold text-gray uppercase tracking-wider hidden md:table-cell">
                Message
              </th>
              <th
                className="text-right py-[1rem] px-[0.75rem] text-sm font-semibold text-gray uppercase tracking-wider cursor-pointer hover:text-antracite transition-colors select-none"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end gap-[0.5rem]">
                  <span>Amount</span>
                  {getSortIcon('amount')}
                </div>
              </th>
              <th className="text-center py-[1rem] px-[0.75rem] text-sm font-semibold text-gray uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-input-gray">
            {currentDonations.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-[3rem] text-gray">
                  {searchQuery ? 'No donations found matching your search' : 'No donations yet'}
                </td>
              </tr>
            ) : (
              currentDonations.map((donation) => (
                <tr
                  key={donation.id}
                  className="hover:bg-light-gray/30 transition-colors"
                >
                  {/* Date & Time */}
                  <td className="py-[1rem] px-[0.75rem] text-antracite text-sm">
                    <div className="flex items-center gap-[0.5rem]">
                      <Calendar className="w-[1rem] h-[1rem] text-gray" />
                      <div>
                        <div className="font-medium">
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

                  {/* Donor Name */}
                  <td className="py-[1rem] px-[0.75rem]">
                    <div className="flex flex-col">
                      <span className="text-antracite font-medium">
                        {donation.anonymous ? (
                          <span className="italic text-gray">Anonymous</span>
                        ) : (
                          donation.donor_name || 'N/A'
                        )}
                      </span>
                      {!donation.anonymous && donation.donor_email && (
                        <span className="text-xs text-gray lg:hidden">
                          {donation.donor_email}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Email - hidden on mobile */}
                  <td className="py-[1rem] px-[0.75rem] text-gray text-sm hidden lg:table-cell">
                    {donation.anonymous ? (
                      <span className="italic">Hidden</span>
                    ) : (
                      <div className="max-w-[12rem] truncate">
                        {donation.donor_email || '-'}
                      </div>
                    )}
                  </td>

                  {/* Message - hidden on small screens */}
                  <td className="py-[1rem] px-[0.75rem] text-gray text-sm hidden md:table-cell">
                    <div className="max-w-[15rem]" title={donation.message || ''}>
                      {truncateMessage(donation.message)}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-[1rem] px-[0.75rem] text-right">
                    <span className="text-lg font-bold text-green">
                      €{donation.amount.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray ml-[0.25rem]">
                      {donation.currency}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-[1rem] px-[0.75rem] text-center">
                    <Badge
                      variant={
                        donation.status === 'completed'
                          ? 'default'
                          : donation.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className="capitalize"
                    >
                      {donation.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary and Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-[1rem] text-sm text-gray">
        <span>
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
    </div>
  );
};

export default DonationsSection;
