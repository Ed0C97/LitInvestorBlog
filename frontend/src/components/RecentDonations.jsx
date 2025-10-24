// LitInvestorBlog-frontend/src/components/RecentDonations.jsx

import React, { useState, useEffect } from 'react';
import UserAvatar from './ui/UserAvatar';
import { Users, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Rocket } from 'lucide-react';

const RecentDonations = () => {
  const [donations, setDonations] = useState([]);
  const [totalDonors, setTotalDonors] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    fetchRecentDonations();
    
    // Poll per aggiornamenti in real-time ogni 30 secondi
    const interval = setInterval(fetchRecentDonations, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedDonations = () => {
    if (!sortConfig.key) return donations;

    const sorted = [...donations].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'donor':
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

  const fetchRecentDonations = async () => {
    try {
      console.log('🔍 Fetching donations from:', '/api/donations/recent?limit=5');
      const response = await fetch('/api/donations/recent?limit=5');
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Data received:', data);
        console.log('📊 Donations array:', data.donations);
        console.log('👥 Total donors:', data.total_donors);
        setDonations(data.donations || []);
        setTotalDonors(data.total_donors || 0);
      } else {
        console.error('❌ Response not ok:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
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
    <div className="w-full space-y-[2rem]">
      {/* Header con totale donatori e toggle collapse */}
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

      {/* Tabella - Collapsabile con animazione professionale avanzata */}
      <div 
        className={`transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden relative z-20 ${
          isCollapsed 
            ? 'max-h-0 opacity-0 blur-sm' 
            : 'max-h-[2000px] opacity-100 blur-0'
        }`}
      >
        <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-input-gray bg-white-glass shadow-none">
              <th 
                className="text-left py-[1rem] px-[0.75rem] text-sm font-semibold text-gray uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-[0.5rem]">
                  <span>#</span>
                  {getSortIcon('id')}
                </div>
              </th>
              <th 
                className="text-left py-[1rem] px-[0.75rem] text-sm font-semibold text-gray uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none"
                onClick={() => handleSort('donor')}
              >
                <div className="flex items-center gap-[0.5rem]">
                  <span>Donor</span>
                  {getSortIcon('donor')}
                </div>
              </th>
              <th className="text-left py-[1rem] px-[0.75rem] text-sm font-semibold text-gray uppercase tracking-wider hidden sm:table-cell hover:text-white transition-colors">
                Message
              </th>
              <th 
                className="text-right py-[1rem] px-[0.75rem] text-sm font-semibold text-gray uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none"
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
            {donations.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-[3rem] text-gray">
                  No donations yet. Be the first!
                </td>
              </tr>
            ) : (
              <>
                {getSortedDonations().slice(0, 5).map((donation, index) => {
                const displayName = donation.anonymous || !donation.donor_name 
                  ? 'Anonymous' 
                  : donation.donor_name;
                
                const isAnonymous = displayName === 'Anonymous';

                return (
                  <tr 
                    key={donation.id} 
                    className="hover:bg-gray/5 transition-colors"
                  >
                    {/* ID - Mostra l'ID reale dal database */}
                    <td className="py-[1rem] px-[0.75rem] text-white font-medium">
                      {donation.id}
                    </td>

                    {/* Donor con Avatar */}
                    <td className="py-[1rem] px-[0.75rem]">
                      <div className="flex items-center gap-[0.75rem]">
                        <UserAvatar
                          username={isAnonymous ? 'Anonymous' : displayName}
                          first_name={isAnonymous ? 'A' : undefined}
                          imageUrl={isAnonymous ? null : donation.avatar_url}
                          size={32}
                          className="flex-shrink-0"
                        />
                        <span className="text-white font-medium truncate max-w-[8rem] sm:max-w-[12rem]">
                          {displayName}
                        </span>
                      </div>
                    </td>

                    {/* Message - nascosto su mobile */}
                    <td className="py-[1rem] px-[0.75rem] text-gray hidden sm:table-cell">
                      <div className="max-w-[20rem] truncate">
                        {donation.message || '—'}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-[1rem] px-[0.75rem] text-right">
                      <span className="text-yellow font-bold text-lg">
                        €{parseFloat(donation.amount).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              
              {/* Riga finale con ... per indicare che ci sono più donazioni */}
              {totalDonors > 5 && (
                <tr className="border-t-2 border-input-gray">
                  <td className="py-[1rem] px-[0.75rem] text-center text-gray text-xl font-bold">
                    ⋯
                  </td>
                  <td className="py-[1rem] px-[0.75rem] text-center text-gray text-xl font-bold">
                    ⋯
                  </td>
                  <td className="py-[1rem] px-[0.75rem] text-center text-gray text-xl font-bold hidden sm:table-cell">
                    ⋯
                  </td>
                  <td className="py-[1rem] px-[0.75rem] text-center text-gray text-xl font-bold">
                    ⋯
                  </td>
                </tr>
              )}
            </>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Messaggio incoraggiante - Visibile solo quando tabella aperta */}
      {!isCollapsed && donations.length > 0 && (
        <p className="flex items-center justify-center gap-2 text-center text-sm text-gray italic">
          <span>Thank you to all our generous supporters!</span>
          <Rocket className="w-4 h-4 text-gray" />
        </p>
      )}
    </div>
  );
};

export default RecentDonations;
