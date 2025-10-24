// LitInvestorBlog-frontend/src/pages/ProfilePage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/AuthContext.js';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import {
  User,
  Linkedin,
  Save,
  Camera,
} from 'lucide-react';
import { toast } from 'sonner';
import UserAvatar from '../components/ui/UserAvatar';
import RoleBadge from '../components/ui/RoleBadge';

const ProfilePage = () => {
  const { user, setUser, updateProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    linkedin_url: '',
    newsletter_subscribed: false,
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        linkedin_url: user.linkedin_url || '',
        newsletter_subscribed: user.newsletter_subscribed || false,
      });
      setAvatarPreview(user.avatar_url || null);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({ ...prev, newsletter_subscribed: checked }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      handleAvatarUpload(file);
    }
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('avatar', file);

    try {
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: uploadData,
      });
      const result = await response.json();
      if (response.ok) {
        toast.success('Avatar updated successfully!');
        setUser(prevUser => ({ ...prevUser, avatar_url: result.avatar_url }));
      } else {
        toast.error(result.error || 'Upload failed.');
        setAvatarPreview(user.avatar_url || null);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted by React StrictMode, ignoring. This is normal in dev.');
      } else {
        toast.error('Connection error during upload.');
        setAvatarPreview(user.avatar_url || null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfile(formData);
    if (result.success) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error(result.error || 'Error updating profile.');
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="text-center p-[5rem] text-dark-gray">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="w-full mb-[3rem]">
        <div className="max-w-[1012px] mx-auto px-[1rem] pt-[3rem]">
          <div className="border-b border-input-gray my-[1rem]"></div>
          <h2 className="text-2xl font-regular">
            <span className="text-dark-gray">Welcome</span>,{' '}
            <span className="text-antracite">{user.username}</span>
          </h2>
        </div>
      </div>

      <div className="max-w-[1012px] mx-auto px-[1rem] pb-[4rem]">
        <div className="mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif, image/webp"
                  />
                  <div onClick={() => !isUploading && fileInputRef.current.click()}>
                    <UserAvatar
                      username={user.username}
                      first_name={user.first_name}
                      last_name={user.last_name}
                      imageUrl={avatarPreview}
                      size={80}
                    />
                  </div>
                  <div className="absolute inset-[0rem] bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-opacity duration-300 cursor-pointer"
                       onClick={() => !isUploading && fileInputRef.current.click()}>
                    <Camera className={`w-[2rem] h-[2rem] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isUploading ? 'animate-pulse' : ''}`} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-antracite">
                    {formData.first_name} {formData.last_name}
                  </h3>
                  <p className="text-dark-gray">{user.email}</p>
                </div>
              </div>

              <div className="hidden md:flex flex-col items-end text-sm text-dark-gray space-y-1">
                <RoleBadge role={user.role} />

                {user.created_at && (
                  <div className="flex items-center space-x-2 text-xs text-dark-gray">
                    <span>
                      Member since{' '}
                      {new Date(user.created_at).toLocaleDateString('en-US')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold border-b border-input-gray pb-[0.5rem] text-antracite">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem]">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 text-dark-gray w-[1rem] h-[1rem]" />
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="pl-[2.25rem] bg-white-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 text-dark-gray w-[1rem] h-[1rem]" />
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="pl-[2.25rem] bg-white-white"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="bg-white-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                <div className="relative">
                  <Linkedin className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 text-blue w-[1rem] h-[1rem]" />
                  <Input
                    id="linkedin_url"
                    name="linkedin_url"
                    type="url"
                    value={formData.linkedin_url}
                    onChange={handleInputChange}
                    className="pl-[2.25rem] bg-white-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold border-b border-input-gray pb-[0.5rem] text-antracite">
                Preferences
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="newsletter">Newsletter Subscription</Label>
                  <p className="text-sm text-dark-gray">
                    Receive updates and analysis via email.
                  </p>
                </div>
                <Switch
                  id="newsletter"
                  checked={formData.newsletter_subscribed}
                  onCheckedChange={handleSwitchChange}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                variant="outline-blue"
              >
                <Save className="w-[1rem] h-[1rem] mr-[0.5rem]" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
