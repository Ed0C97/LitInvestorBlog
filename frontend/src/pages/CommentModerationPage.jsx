import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext.js';
import RoleGuard from '../components/RoleGuard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { MessageSquare, Search, Filter, Check, X, Flag, Eye, Calendar, User, FileText, AlertTriangle, CheckCircle, XCircle, Clock, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { toast } from 'sonner';

const CommentModerationPage = () => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedComments, setSelectedComments] = useState([]);
  const [moderationReason, setModerationReason] = useState('');

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    filterComments();
  }, [comments, searchTerm, statusFilter]);

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/comments/moderate', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Error loading comments');
    } finally {
      setLoading(false);
    }
  };

  const filterComments = () => {
    let filtered = [...comments];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((comment) => comment.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (comment) =>
          comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comment.user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comment.article?.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setFilteredComments(filtered);
  };

  const moderateComment = async (commentId, action, reason = '') => {
    try {
      const response = await fetch(`/api/comments/${commentId}/moderate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? { ...comment, status: data.status, moderation_reason: reason }
              : comment,
          ),
        );

        const actionText = {
          approve: 'approved',
          reject: 'rejected',
          delete: 'deleted',
        };

        toast.success(`Comment ${actionText[action]}`);
      } else {
        toast.error('Error during moderation');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Connection error');
    }
  };

  const moderateMultiple = async (action) => {
    if (selectedComments.length === 0) {
      toast.error('Select at least one comment');
      return;
    }

    try {
      const response = await fetch('/api/comments/moderate-bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment_ids: selectedComments,
          action,
          reason: moderationReason,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prev) =>
          prev.map((comment) =>
            selectedComments.includes(comment.id)
              ? { ...comment, status: data.status, moderation_reason: moderationReason }
              : comment,
          ),
        );

        setSelectedComments([]);
        setModerationReason('');

        const actionText = {
          approve: 'approved',
          reject: 'rejected',
          delete: 'deleted',
        };

        toast.success(`${selectedComments.length} comments ${actionText[action]}`);
      } else {
        toast.error('Error during bulk moderation');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Connection error');
    }
  };

  const toggleCommentSelection = (commentId) => {
    setSelectedComments((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId],
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredComments.map((comment) => comment.id);
    setSelectedComments(visibleIds);
  };

  const clearSelection = () => {
    setSelectedComments([]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-light-gray-success text-light-gray-success-foreground">
            <CheckCircle className="w-[0.75rem] h-[0.75rem] mr-[0.25rem]" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-light-gray-destructive text-light-gray-destructive-foreground">
            <XCircle className="w-[0.75rem] h-[0.75rem] mr-[0.25rem]" />
            Rejected
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-light-gray-warning text-light-gray-warning-foreground">
            <Clock className="w-[0.75rem] h-[0.75rem] mr-[0.25rem]" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="border-input-gray">{status}</Badge>;
    }
  };

  const getStats = () => {
    const total = comments.length;
    const pending = comments.filter((c) => c.status === 'pending').length;
    const approved = comments.filter((c) => c.status === 'approved').length;
    const rejected = comments.filter((c) => c.status === 'rejected').length;
    const reported = comments.filter((c) => c.reported).length;

    return { total, pending, approved, rejected, reported };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="container mx-auto px-[1rem] py-[2rem]">
        <div className="text-center">
          <div className="w-[2rem] h-[2rem] bg-blue rounded-lg flex items-center justify-center mx-auto mb-[1rem]">
            <span className="text-light-gray font-bold text-lg">L</span>
          </div>
          <p className="text-gray">Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard user={user} requiredRole="admin">
      <div className="container mx-auto px-[1rem] py-[2rem]">
        <div className="mb-[2rem]">
          <h1 className="text-3xl font-bold mb-[0.5rem] flex items-center space-x-2">
            <MessageSquare className="w-[2rem] h-[2rem]" />
            <span>Comment Moderation</span>
          </h1>
          <p className="text-gray">
            Manage and moderate user comments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-[1rem] mb-[2rem]">
          <Card>
            <CardContent className="pt-[1.5rem] text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-[1.5rem] text-center">
              <div className="text-2xl font-bold text-light-gray-warning-foreground">
                {stats.pending}
              </div>
              <div className="text-sm text-gray">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-[1.5rem] text-center">
              <div className="text-2xl font-bold text-light-gray-success-foreground">
                {stats.approved}
              </div>
              <div className="text-sm text-gray">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-[1.5rem] text-center">
              <div className="text-2xl font-bold text-light-gray-destructive-foreground">
                {stats.rejected}
              </div>
              <div className="text-sm text-gray">Rejected</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-[1.5rem] text-center">
              <div className="text-2xl font-bold text-dark-gray">
                {stats.reported}
              </div>
              <div className="text-sm text-gray">Reported</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-[1.5rem]">
          <CardContent className="pt-[1.5rem]">
            <div className="flex flex-col md:flex-row gap-[1rem] mb-[1rem]">
              <div className="flex-1">
                <div className="relative">
                    <Search className="absolute left-[0.75rem] top-1/2 transform -translate-y-1/2 text-dark-gray w-[1rem] h-[1rem]" />
                    <Input
                      type="text"
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-[2.5rem]"
                    />
                  </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[12rem]">
                  <Filter className="w-[1rem] h-[1rem] mr-[0.5rem]" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All comments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="reported">Reported</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedComments.length > 0 && (
              <div className="border-t pt-[1rem]">
                <div className="flex items-center justify-between mb-[1rem]">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {selectedComments.length} comments selected
                    </span>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      Deselect all
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => moderateMultiple('approve')}
                      className="bg-light-gray-success hover:bg-light-gray-success/90 text-light-gray-success-foreground"
                    >
                      <Check className="w-[1rem] h-[1rem] mr-[0.25rem]" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="red"
                      onClick={() => moderateMultiple('reject')}
                    >
                      <X className="w-[1rem] h-[1rem] mr-[0.25rem]" />
                      Reject
                    </Button>
                  </div>
                </div>

                <Textarea
                  placeholder="Moderation reason (optional)"
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  rows={2}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {filteredComments.length === 0 ? (
          <Card>
            <CardContent className="pt-[1.5rem]">
              <div className="text-center py-[2rem]">
                <MessageSquare className="w-[4rem] h-[4rem] text-gray mx-auto mb-[1rem] opacity-50" />
                <h3 className="text-xl font-semibold mb-[0.5rem]">
                  {comments.length === 0
                    ? 'No comments to moderate'
                    : 'No comments found'}
                </h3>
                <p className="text-gray">
                  {comments.length === 0
                    ? 'All comments have been moderated'
                    : 'Try adjusting your search filters'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray">
                {filteredComments.length} comments found
              </p>
              <Button variant="outline" size="sm" onClick={selectAllVisible}>
                Select all visible
              </Button>
            </div>

            {filteredComments.map((comment) => (
              <Card
                key={comment.id}
                className={selectedComments.includes(comment.id) ? 'ring-2 ring-blue' : ''}
              >
                <CardContent className="pt-[1.5rem]">
                  <div className="flex gap-[1rem]">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedComments.includes(comment.id)}
                        onChange={() => toggleCommentSelection(comment.id)}
                        className="mt-[0.25rem]"
                      />
                      <Avatar>
                        <AvatarImage
                          src={comment.user?.avatar_url}
                          alt={comment.user?.username}
                        />
                        <AvatarFallback>
                          {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-[0rem]">
                      <div className="flex items-start justify-between mb-[0.75rem]">
                        <div className="flex items-center space-x-2 flex-wrap">
                          {getStatusBadge(comment.status)}
                          {comment.reported && (
                            <Badge variant="red">
                              <Flag className="w-[0.75rem] h-[0.75rem] mr-[0.25rem]" />
                              Reported
                            </Badge>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-[1rem] h-[1rem]" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {comment.status === 'pending' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => moderateComment(comment.id, 'approve')}
                                  className="text-light-gray-success-foreground"
                                >
                                  <Check className="w-[1rem] h-[1rem] mr-[0.5rem]" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => moderateComment(comment.id, 'reject')}
                                  className="text-light-gray-destructive-foreground"
                                >
                                  <X className="w-[1rem] h-[1rem] mr-[0.5rem]" />
                                  Reject
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem asChild>
                              <Link
                                to={`/article/${comment.article?.slug}#comment-${comment.id}`}
                                target="_blank"
                              >
                                <Eye className="w-[1rem] h-[1rem] mr-[0.5rem]" />
                                View in article
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mb-[0.75rem]">
                        <div className="flex items-center space-x-2 text-sm text-gray mb-[0.5rem]">
                          <User className="w-[1rem] h-[1rem]" />
                          <span className="font-medium">
                            {comment.user?.username || 'Deleted user'}
                          </span>
                          <span>•</span>
                          <Calendar className="w-[1rem] h-[1rem]" />
                          <span>{formatDate(comment.created_at)}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-gray mb-[0.75rem]">
                          <FileText className="w-[1rem] h-[1rem]" />
                          <Link
                            to={`/article/${comment.article?.slug}`}
                            className="hover:text-blue transition-colors line-clamp-1"
                            target="_blank"
                          >
                            {comment.article?.title || 'Deleted article'}
                          </Link>
                        </div>
                      </div>

                      <div className="bg-light-gray/50 rounded-lg p-[0.75rem] mb-[0.75rem]">
                        <p className="text-antracite whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>

                      {comment.moderation_reason && (
                        <div className="bg-light-gray-warning/10 border border-light-gray-warning rounded-lg p-[0.75rem] mb-[0.75rem]">
                          <div className="flex items-center space-x-2 mb-[0.25rem]">
                            <AlertTriangle className="w-[1rem] h-[1rem] text-light-gray-warning-foreground" />
                            <span className="text-sm font-medium text-light-gray-warning-foreground">
                              Moderation reason:
                            </span>
                          </div>
                          <p className="text-sm text-dark-gray">
                            {comment.moderation_reason}
                          </p>
                        </div>
                      )}

                      {comment.status === 'pending' && (
                        <div className="flex items-center space-x-2 mt-[0.75rem]">
                          <Button
                            size="sm"
                            onClick={() => moderateComment(comment.id, 'approve')}
                            className="bg-light-gray-success hover:bg-light-gray-success/90 text-light-gray-success-foreground"
                          >
                            <Check className="w-[1rem] h-[1rem] mr-[0.25rem]" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="red"
                            onClick={() => moderateComment(comment.id, 'reject')}
                          >
                            <X className="w-[1rem] h-[1rem] mr-[0.25rem]" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
};

export default CommentModerationPage;
