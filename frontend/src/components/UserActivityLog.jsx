// LitInvestorBlog-frontend/src/components/UserActivityLog.jsx

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { 
  X, 
  AlertTriangle, 
  Ban, 
  Mail, 
  MessageSquare,
  Calendar,
  Flag,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import UserAvatar from './ui/UserAvatar';
import { toast } from 'sonner';

const UserActivityLog = ({ user, onClose }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState('');
  const [showWarningForm, setShowWarningForm] = useState(false);
  const [showBanConfirm, setShowBanConfirm] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchUserComments();
    
    // Polling ogni 5 secondi per aggiornare i contatori dei report
    const pollInterval = setInterval(() => {
      fetchUserComments();
    }, 5000);
    
    return () => clearInterval(pollInterval);
  }, [user.id]);

  const fetchUserComments = async () => {
    try {
      const response = await fetch(`/api/moderation/users/${user.id}/comments`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('❌ Error fetching user comments:', error);
      toast.error('Failed to load user activity');
    } finally {
      setLoading(false);
    }
  };

  const handleSendWarning = async () => {
    if (!warningMessage.trim()) {
      toast.error('Please enter a warning message');
      return;
    }

    setProcessingAction(true);
    try {
      const response = await fetch(`/api/moderation/users/${user.id}/warn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: warningMessage }),
      });

      if (response.ok) {
        toast.success('Warning email sent successfully');
        setShowWarningForm(false);
        setWarningMessage('');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to send warning');
      }
    } catch (error) {
      console.error('❌ Error sending warning:', error);
      toast.error('Failed to send warning');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleBanUser = async () => {
    if (!banReason.trim()) {
      toast.error('Please enter a ban reason');
      return;
    }

    setProcessingAction(true);
    try {
      const response = await fetch(`/api/moderation/users/${user.id}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: banReason }),
      });

      if (response.ok) {
        toast.success('User banned successfully');
        onClose();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to ban user');
      }
    } catch (error) {
      console.error('❌ Error banning user:', error);
      toast.error('Failed to ban user');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDismissReport = async (commentId) => {
    try {
      const response = await fetch(`/api/moderation/comments/${commentId}/dismiss-reports`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Reports dismissed');
        fetchUserComments();
      } else {
        toast.error('Failed to dismiss reports');
      }
    } catch (error) {
      console.error('❌ Error dismissing reports:', error);
      toast.error('Failed to dismiss reports');
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      className="max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col"
    >
    <div className="flex items-center justify-between p-[1.5rem] border-b border-input-gray">
      <div className="flex items-center gap-[1rem]">
        <UserAvatar
          username={user.username}
          first_name={user.first_name}
          imageUrl={user.avatar_url}
          size={48}
        />
        <div>
          <h2 className="text-xl font-bold text-dark">
            {user.username}
          </h2>
          <p className="text-sm text-gray">
            {user.first_name} {user.last_name} · {user.email}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
      >
        <X className="w-[1.5rem] h-[1.5rem]" />
      </Button>
    </div>

    {/* User Info Summary */}
    <div className="p-[1.5rem] bg-light-gray/30 border-b border-input-gray">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-[1rem]">
        <div>
          <p className="text-xs text-gray uppercase tracking-wide mb-[0.25rem]">Joined</p>
          <p className="text-sm font-semibold text-dark">
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray uppercase tracking-wide mb-[0.25rem]">Role</p>
          <Badge variant="outline" className="capitalize">
            {user.role}
          </Badge>
        </div>
        <div>
          <p className="text-xs text-gray uppercase tracking-wide mb-[0.25rem]">Total Reports</p>
          <p className="text-sm font-semibold text-dark">
            {user.reports_count || 0}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray uppercase tracking-wide mb-[0.25rem]">Status</p>
          <Badge
            variant={user.is_active ? 'secondary' : 'destructive'}
          >
            {user.is_active ? 'Active' : 'Banned'}
          </Badge>
        </div>
      </div>
    </div>

    {/* Actions Bar */}
    <div className="flex gap-[0.5rem] p-[1rem] border-b border-input-gray bg-white">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowWarningForm(!showWarningForm)}
        disabled={!user.is_active}
      >
        <Mail className="w-[1rem] h-[1rem] mr-[0.5rem]" />
        Send Warning
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setShowBanConfirm(true)}
        disabled={!user.is_active}
      >
        <Ban className="w-[1rem] h-[1rem] mr-[0.5rem]" />
        Ban User
      </Button>
    </div>

    {/* Warning Form */}
    {showWarningForm && (
      <div className="p-[1rem] border-b border-input-gray bg-yellow/10">
        <label className="block text-sm font-semibold text-dark mb-[0.5rem]">
          Warning Message
        </label>
        <Textarea
          value={warningMessage}
          onChange={(e) => setWarningMessage(e.target.value)}
          placeholder="Enter warning message to send to the user..."
          className="mb-[0.5rem]"
          rows={3}
        />
        <div className="flex gap-[0.5rem]">
          <Button
            size="sm"
            onClick={handleSendWarning}
            disabled={processingAction || !warningMessage.trim()}
          >
            Send Warning
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowWarningForm(false);
              setWarningMessage('');
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    )}

    {/* Ban Confirmation */}
    {showBanConfirm && (
      <div className="p-[1rem] border-b border-input-gray bg-red/10">
        <div className="flex items-start gap-[0.75rem] mb-[0.75rem]">
          <AlertTriangle className="w-[1.25rem] h-[1.25rem] text-red flex-shrink-0 mt-[0.25rem]" />
          <div>
            <h3 className="text-sm font-semibold text-dark mb-[0.25rem]">
              Ban User Confirmation
            </h3>
            <p className="text-sm text-gray">
              This action will deactivate the account and add the user to the blacklist.
            </p>
          </div>
        </div>
        <Textarea
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
          placeholder="Enter ban reason (required for records)..."
          className="mb-[0.5rem]"
          rows={2}
        />
        <div className="flex gap-[0.5rem]">
          <Button
            size="sm"
            variant="destructive"
            onClick={handleBanUser}
            disabled={processingAction || !banReason.trim()}
          >
            Confirm Ban
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowBanConfirm(false);
              setBanReason('');
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    )}

    {/* Comments List */}
    <div className="flex-1 overflow-y-auto p-[1.5rem]">
      <h3 className="text-lg font-bold text-dark mb-[1rem] flex items-center gap-[0.5rem]">
        <MessageSquare className="w-[1.25rem] h-[1.25rem]" />
        User Comments ({comments.length})
      </h3>

      {loading ? (
        <div className="text-center py-[2rem] text-gray">
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-[2rem] text-gray">
          No comments found
        </div>
      ) : (
        <div className="space-y-[0rem]">
          {comments.map((comment, index) => (
            <div
              key={comment.id}>
              {/* Divider line - non mostrare prima del primo elemento */}
              {index > 0 && (
                <div className="border-t border-input-gray my-[1.5rem]" />
              )}

              <div className={`py-[0.5rem] ${
                comment.reports_count > 0 ? '' : ''
              }`}>
                {/* Comment Header */}
                <div className="flex items-start justify-between mb-[0.75rem]">
                  <div className="flex items-center gap-[0.5rem] flex-wrap">
                    <Calendar className="w-[0.875rem] h-[0.875rem] text-gray" />
                    <span className="text-sm text-gray">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                    {comment.reports_count > 0 && (
                      <Badge variant="destructive" className="ml-[0.5rem]">
                        <Flag className="w-[0.75rem] h-[0.75rem] mr-[0.25rem]" />
                        {comment.reports_count} {comment.reports_count === 1 ? 'report' : 'reports'}
                      </Badge>
                    )}
                  </div>
                  <a
                    href={`/article/${comment.article_id}#comment-${comment.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue hover:text-blue/80 transition-colors"
                    title="View in article"
                  >
                    <ExternalLink className="w-[1rem] h-[1rem]" />
                  </a>
                </div>

                {/* Article Info */}
                <div className="mb-[0.5rem]">
                  <p className="text-xs text-gray">
                    Article: <span className="font-semibold text-dark">{comment.article_title}</span>
                  </p>
                </div>

                {/* Comment Content */}
                <div className="bg-light-gray/30 p-[0.75rem] rounded mb-[0.75rem]">
                  <p className="text-sm text-dark whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>

                {/* Report Details */}
                {comment.reports_count > 0 && comment.report_reasons && (
                  <div className="bg-red/10 p-[0.75rem] rounded border border-red/30 mb-[0.75rem]">
                    <p className="text-xs font-semibold text-red mb-[0.25rem]">
                      Report Reasons:
                    </p>
                    <ul className="text-xs text-red/80 space-y-[0.125rem]">
                      {comment.report_reasons.split(',').map((reason, idx) => (
                        <li key={idx}>• {reason.trim()}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                {comment.reports_count > 0 && (
                  <div className="flex gap-[0.5rem]">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismissReport(comment.id)}
                      className="border-green text-green hover:bg-green/10"
                    >
                      <CheckCircle className="w-[0.875rem] h-[0.875rem] mr-[0.25rem]" />
                      Dismiss Reports
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </Modal>
  );
};

export default UserActivityLog;
