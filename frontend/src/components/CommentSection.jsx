// LitInvestorBlog-frontend/src/components/CommentSection.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import UserAvatar from './ui/UserAvatar';
import { Badge } from './ui/badge';
import {
  MessageSquare,
  Heart,
  Reply,
  Flag,
  MoreVertical,
  Edit2,
  Trash2,
  Send,
  Loader2,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuth } from '../hooks/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Link } from "react-router-dom";
import ReportDialog from './ReportDialog';

// Utility per linkificare gli @mentions
const linkifyMentions = (text) => {
  return text.replace(/@(\w+)/g, '<span class="text-blue font-semibold">@$1</span>');
};

// Utility per il markdown base (grassetto, corsivo, link)
const parseMarkdown = (text) => {
  let parsed = text;

  // **grassetto**
  parsed = parsed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // *corsivo*
  parsed = parsed.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // [link](url)
  parsed = parsed.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue hover:underline">$1</a>');

  // @mentions
  parsed = linkifyMentions(parsed);

  return parsed;
};

// Component per un singolo commento
const CommentItem = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onLike,
  onReport,
  currentUser,
  isReply = false,
  level = 0
}) => {
  const { user } = useAuth();
  const commentRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const isOwner = user?.id === comment.user_id;
  const isAdmin = user?.role === 'admin';
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    if (editContent.length > 5000) {
      toast.error('Comment cannot exceed 5000 characters');
      return;
    }

    await onEdit(comment.id, editContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    if (replyContent.length > 5000) {
      toast.error('Reply cannot exceed 5000 characters');
      return;
    }

    setIsSubmittingReply(true);
    const success = await onReply(comment.id, replyContent);

    if (success) {
      setReplyContent('');
      setShowReplyForm(false);
    }
    setIsSubmittingReply(false);
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: enUS
      });
    } catch {
      return '';
    }
  };

  // Effetto highlight quando si arriva da un link esterno
  useEffect(() => {
    // Controlla se l'hash nell'URL corrisponde a questo commento
    if (window.location.hash === `#comment-${comment.id}`) {
      setTimeout(() => {
        commentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        commentRef.current?.classList.add('highlight-comment');
        setTimeout(() => {
          commentRef.current?.classList.remove('highlight-comment');
        }, 3000);
      }, 500);
    }
  }, [comment.id]);

  return (
    <div
      id={`comment-${comment.id}`}
      ref={commentRef}
      className={`${level > 0 ? '' : ''} transition-all duration-300`}
    >
      <div className="space-y-[0.75rem]">
        {/* Header */}
        <div className="flex items-start justify-between gap-[0.5rem]">
          <div className="flex items-center gap-[0.75rem]">
            <UserAvatar
              username={comment.user?.username}
              first_name={comment.user?.first_name}
              last_name={comment.user?.last_name}
              imageUrl={comment.user?.avatar_url}
              size={40}
              className="h-[2rem] w-[2rem] sm:h-[2.5rem] sm:w-[2.5rem]"
            />

            <div className="flex flex-col">
              <div className="flex items-center gap-[0.5rem]">
                <span className="font-semibold text-sm sm:text-base text-antracite">
                  {comment.user?.username || 'User'}
                </span>
                {comment.user?.role === 'admin' && (
                  <Badge variant="green" className="text-xs px-[0.5rem] py-0">
                    Admin
                  </Badge>
                )}
              </div>
              <span className="text-xs text-gray">
                {formatDate(comment.created_at)}
              </span>
            </div>
          </div>

          {/* Actions Dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-[2rem] w-[2rem] p-0"
                >
                  <MoreVertical className="h-[1rem] w-[1rem]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[10rem]">
                {canEdit && (
                  <DropdownMenuItem
                    onClick={() => setIsEditing(true)}
                    className="cursor-pointer"
                  >
                    <Edit2 className="mr-[0.5rem] h-[1rem] w-[1rem]" />
                    Edit
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(comment.id)}
                    className="cursor-pointer text-red"
                  >
                    <Trash2 className="mr-[0.5rem] h-[1rem] w-[1rem]" />
                    Delete
                  </DropdownMenuItem>
                )}
                {!isOwner && (
                  <DropdownMenuItem
                    onClick={() => onReport(comment.id)}
                    className="cursor-pointer"
                  >
                    <Flag className="mr-[0.5rem] h-[1rem] w-[1rem]" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-[0.5rem]">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[5rem] resize-none"
              maxLength={5000}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray">
                {editContent.length}/5000
              </span>
              <div className="flex gap-[0.5rem]">
                <Button
                  size="sm"
                  variant="outline-red"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="outline-green"
                  onClick={handleSaveEdit}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="text-sm sm:text-base text-antracite leading-relaxed"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(comment.content) }}
          />
        )}

        {/* Actions Bar */}
        {!isEditing && (
          <div className="flex items-center gap-[1rem] sm:gap-[1.5rem]">
            {/* Like Button */}
            <button
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-[0.25rem] transition-colors ${
                comment.user_liked 
                  ? 'text-red' 
                  : 'text-gray hover:text-red'
              }`}
              disabled={!user}
            >
              <Heart
                className={`h-[1rem] w-[1rem] ${comment.user_liked ? 'fill-current' : ''}`}
              />
              <span className="text-sm font-medium">
                {comment.likes_count || 0}
              </span>
            </button>

            {/* Reply Button */}
            {user && level === 0 && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-[0.25rem] text-gray hover:text-blue transition-colors"
              >
                <Reply className="h-[1rem] w-[1rem]" />
                <span className="text-sm font-medium">Reply</span>
              </button>
            )}

            {/* Replies count indicator */}
            {comment.replies && comment.replies.length > 0 && (
              <span className="text-xs text-gray">
                {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </span>
            )}
          </div>
        )}

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-[0.75rem] space-y-[0.5rem] bg-light-gray/30 p-[1rem] rounded-lg">
            <div className="flex items-start gap-[0.75rem]">
              <UserAvatar
                username={currentUser?.username}
                first_name={currentUser?.first_name}
                last_name={currentUser?.last_name}
                imageUrl={currentUser?.avatar_url}
                size={40}
                className="h-[2.5rem] w-[2.5rem] flex-shrink-0"
              />

              <div className="flex-1 space-y-[0.5rem]">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Replying to ${comment.user?.username}...`}
                  className="min-h-[3rem] resize-none"
                  maxLength={5000}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleSubmitReply}
                    disabled={isSubmittingReply || !replyContent.trim()}
                  >
                    {isSubmittingReply ? (
                      <Loader2 className="h-[1rem] w-[1rem] animate-spin mr-[0.5rem]" />
                    ) : (
                      <Send className="h-[1rem] w-[1rem] mr-[0.5rem]" />
                    )}
                    Send Reply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className={`ml-[2rem] sm:ml-[3rem] mt-[1rem] space-y-[1rem] border-l border-input-gray pl-[1rem]`}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onLike={onLike}
              onReport={onReport}
              currentUser={currentUser}
              isReply={true}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Main CommentSection Component
const CommentSection = ({ articleId, onCommentsCountChange }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  // Stato per il popup di report
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Fetch iniziale dei commenti
  useEffect(() => {
    fetchComments(1, true);
  }, [articleId]);

  const fetchComments = async (pageNumber, initialLoad = false) => {
    if (pageNumber === 1 && !initialLoad) {
      setLoading(true);
    } else if (pageNumber > 1) {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(`/api/articles/${articleId}/comments?page=${pageNumber}&limit=10`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();

        setComments(prev =>
          pageNumber === 1
            ? data.comments
            : [...prev, ...data.comments]
        );
        setTotalComments(data.total_comments);
        setHasMore(data.has_more);
        setPage(pageNumber);

        if (onCommentsCountChange) {
          onCommentsCountChange(data.total_comments);
        }
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchComments(page + 1);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    if (newComment.length > 5000) {
      toast.error('Comment cannot exceed 5000 characters');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment.trim(),
          article_id: articleId,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
        setTotalComments(prev => prev + 1);
        if (onCommentsCountChange) {
          onCommentsCountChange(totalComments + 1);
        }
        toast.success('Comment posted!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error posting comment');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Connection error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId, content) => {
    if (!user) {
      toast.error('You must be logged in to reply');
      return false;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          article_id: articleId,
          parent_id: parentId,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();

        // Aggiungi la risposta al commento padre
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), data.comment]
            };
          }
          return comment;
        }));

        toast.success('Reply posted!');
        return true;
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error posting reply');
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Connection error');
      return false;
    }
  };

  const handleEdit = async (commentId, content) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();

        // Aggiorna il commento nella lista
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return data.comment;
          }
          // Aggiorna anche nelle risposte
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === commentId ? data.comment : reply
              )
            };
          }
          return comment;
        }));

        toast.success('Comment updated');
      } else {
        toast.error('Error updating comment');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Connection error');
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        // Rimuovi il commento dalla lista
        setComments(prev => prev.filter(comment => {
          // Se il commento è top-level
          if (comment.id === commentId) {
            return false;
          }
          // Se è una risposta, rimuovila dalle replies
          if (comment.replies) {
            comment.replies = comment.replies.filter(reply => reply.id !== commentId);
          }
          return true;
        }));

        const newCount = Math.max(0, totalComments - 1);
        setTotalComments(newCount);
        if (onCommentsCountChange) {
          onCommentsCountChange(newCount);
        }
        toast.success('Comment deleted');
      } else {
        toast.error('Error deleting comment');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Connection error');
    }
  };

  const handleLike = async (commentId) => {
    if (!user) {
      toast.error('You must be logged in to like');
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();

        // Aggiorna il like nel commento
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes_count: data.likes_count,
              user_liked: data.liked
            };
          }
          // Aggiorna anche nelle risposte
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === commentId
                  ? { ...reply, likes_count: data.likes_count, user_liked: data.liked }
                  : reply
              )
            };
          }
          return comment;
        }));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleReport = (commentId) => {
    if (!user) {
      toast.error('You must be logged in to report');
      return;
    }
    // Queste due righe apriranno la nostra nuova finestra
    setReportingCommentId(commentId);
    setReportDialogOpen(true);
  };

  const handleSubmitReport = async (reason, additionalInfo) => {
    setReportLoading(true);
    try {
      const response = await fetch(`/api/comments/${reportingCommentId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason,
          additional_info: additionalInfo
        }),
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Comment reported. Thank you for your feedback.');
        setReportDialogOpen(false);
        setReportingCommentId(null);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Error submitting report');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Connection error');
    } finally {
      setReportLoading(false);
    }
  };

  const getAvatarColor = (userId) => {
    const colors = [
      'bg-avatar-1', 'bg-avatar-2', 'bg-avatar-3', 'bg-avatar-4',
      'bg-avatar-5', 'bg-avatar-7', 'bg-avatar-8', 'bg-avatar-9',
      'bg-avatar-10', 'bg-avatar-11', 'bg-avatar-12'
    ];
    const index = userId % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="py-[3rem] text-center">
        <Loader2 className="h-[2rem] w-[2rem] animate-spin mx-auto text-gray" />
        <p className="mt-[1rem] text-gray">Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="bg-light-gray py-[2rem] sm:py-[3rem]">
      <div className="max-w-3xl mx-auto px-[2rem] md:px-[0rem] space-y-[2rem]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold text-antracite flex items-center gap-[0.75rem]">
          <MessageSquare className="h-[1.5rem] w-[1.5rem]" />
          Comments
          <span className="text-gray font-normal text-xl">{totalComments}</span>
        </h2>
      </div>

      {/* Comment Input o Empty State unificato */}
      {!user && comments.length === 0 ? (
        // NON loggato E nessun commento - Messaggio unificato
        <div className="text-center py-[4rem] mb-[3rem]">
          <MessageSquare className="h-[4rem] w-[4rem] text-gray/50 mx-auto mb-[1rem]" />
          <p className="text-lg font-semibold text-antracite mb-[0.5rem]">
            No comments yet.
          </p>
          <p className="text-gray mb-[1.5rem]">
            Sign in and be the first to comment!
          </p>
          <Button asChild variant="outline-blue" size="sm">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      ) : user ? (
        // Loggato - Mostra form commento
        <form onSubmit={handleSubmitComment} className="space-y-[0.75rem] mb-[3rem]">
          <div className="flex items-start gap-[0.75rem]">
            <UserAvatar
              username={user.username}
              first_name={user.first_name}
              last_name={user.last_name}
              imageUrl={user.avatar_url}
              size={40}
              className="h-[2.5rem] w-[2.5rem] flex-shrink-0"
            />

            <div className="flex-1 space-y-[1.5rem]">
              <Textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="min-h-[5rem] resize-none"
                maxLength={5000}
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray">
                  {newComment.length}/5000
                </span>

                <Button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  size="sm"
                  variant="outline-blue"
                >
                  {submitting ? (
                    <Loader2 className="h-[1rem] w-[1rem] animate-spin mr-[0.5rem]" />
                  ) : (
                    <Send className="h-[1rem] w-[1rem] mr-[0.5rem]" />
                  )}
                  {submitting ? 'Posting...' : 'Comment'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        // NON loggato MA ci sono commenti - Mostra solo invito a loggarsi
        <div className="text-center py-[2rem] mb-[3rem]">
          <MessageSquare className="h-[3rem] w-[3rem] text-gray/50 mx-auto mb-[1rem]" />
          <p className="text-gray mb-[1rem]">
            Sign in to leave a comment and join the discussion
          </p>
          <Button asChild variant="outline-blue" size="sm">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      )}

      {/* Comments List - Solo se ci sono commenti */}
      {comments.length > 0 && (
        <div className="space-y-[2rem]">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onLike={handleLike}
              onReport={handleReport}
              currentUser={user}
              level={0}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-[1rem]">
          <Button
            variant="outline-red"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="w-full sm:w-auto"
          >
            {loadingMore ? (
              <Loader2 className="h-[1rem] w-[1rem] animate-spin mr-[0.5rem]" />
            ) : null}
            {loadingMore ? 'Loading...' : 'Load more comments'}
          </Button>
        </div>
      )}
      </div>

      {/* Nuovo Popup di Report con lo stile richiesto */}
      <ReportDialog
        isOpen={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        onSubmit={handleSubmitReport}
        loading={reportLoading}
      />
    </div>
  );
};

export default CommentSection;

