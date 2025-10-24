// LitInvestorBlog-frontend/src/pages/AboutPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/AuthContext.js';
import { Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import RelatedArticles from '../components/RelatedArticles';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import founderImage from '../assets/img.png';
import RichTextEditor from '../components/RichTextEditor';
import FadeInOnScroll from '../components/FadeInOnScroll';

const AboutPage = () => {
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState({
    founderName: 'Lit Investor',
    founderRole: 'Director',
    mainText: '',
  });
  const [editContent, setEditContent] = useState('');

  const fetchAboutContent = async () => {
    try {
      const response = await fetch('/api/content/about');
      if (response.ok) {
        const data = await response.json();
        setContent((prev) => ({ ...prev, mainText: data.content.body }));
      } else {
        setContent((prev) => ({ ...prev, mainText: '' }));
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setContent((prev) => ({ ...prev, mainText: '' }));
    }
  };

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const handleEdit = () => {
    setEditContent(content.mainText);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/content/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: editContent }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Save failed.');

      const data = await response.json();
      setContent((prev) => ({ ...prev, mainText: data.content.body }));
      setIsEditing(false);
      toast.success('Content updated!');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error(error.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <SEO 
        title="About Us"
        description="Learn about Lit Investor and our mission to provide expert insights on finance, investments, and personal wealth management."
        keywords={['about', 'Lit Investor', 'finance blog', 'investment insights']}
      />
      <FadeInOnScroll>
        <div className="w-full mb-[4rem]">
          <div className="max-w-[1012px] mx-auto px-[2rem] md:px-[1rem] pt-[3rem] smooth-padding">
            <div className="border-b border-input-gray my-[0.5rem]"></div>
            <h2 className="text-2xl font-regular text-dark-gray">About Us</h2>
          </div>
        </div>
      </FadeInOnScroll>

      <FadeInOnScroll delay={100}>
        <div className="max-w-[1012px] mx-auto px-[2rem] md:px-[1rem] smooth-padding">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[3rem] items-center">
            <div className="md:col-span-2 text-left">
              <h2 className="text-5xl font-semibold text-antracite">
                {content.founderName}
              </h2>
              <p className="text-xl text-dark-gray mt-[1rem]">
                {content.founderRole}
              </p>
            </div>
            <div className="md:col-span-1 flex justify-center md:justify-end">
              <img
                src={founderImage}
                alt={content.founderName}
                className="w-[320px] h-[320px] object-cover"
              />
            </div>
          </div>
        </div>
      </FadeInOnScroll>

      <FadeInOnScroll delay={200}>
        <div className="bg-light-gray">
          <div className="max-w-[1012px] mx-auto px-[2rem] md:px-[1rem] py-[5rem] my-[0rem] smooth-padding">
            <div>
              {isEditing ? (
                <RichTextEditor
                  value={editContent}
                  onChange={setEditContent}
                  placeholder="Write your story here..."
                  height="200px"
                />
              ) : (
                <div className="article-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content.mainText}
                  </ReactMarkdown>
                </div>
              )}

              {isAdmin() && (
                <div className="flex justify-end items-center space-x-6 mt-[1.5rem]">
                  {!isEditing ? (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleEdit();
                      }}
                      className="flex items-center text-sm text-dark-gray hover:text-blue font-medium transition-colors"
                    >
                      <Edit className="w-[1rem] h-[1rem] mr-[0.5rem]" /> Edit Text
                    </a>
                  ) : (
                    <>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSave();
                        }}
                        className="flex items-center text-sm text-dark-gray hover:text-blue font-medium transition-colors"
                      >
                        <Save className="w-[1rem] h-[1rem] mr-[0.5rem]" />{' '}
                        {loading ? 'Saving...' : 'Save'}
                      </a>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCancel();
                        }}
                        className="flex items-center text-sm text-dark-gray hover:text-blue font-medium transition-colors"
                      >
                        <X className="w-[1rem] h-[1rem] mr-[0.5rem]" /> Cancel
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </FadeInOnScroll>

      <FadeInOnScroll>
        <div className="mt-[0.25rem]">
          <RelatedArticles
            title="Most Popular"
            fetchUrl="/api/articles/?per_page=4"
            variant="compact"
          />
        </div>
      </FadeInOnScroll>
    </div>
  );
};

export default AboutPage;
