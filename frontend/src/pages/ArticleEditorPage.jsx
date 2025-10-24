import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Upload, Eye, Save, Image, Plus, X, Calendar, Tag, AlertCircle, FileText, Heading, ImageIcon, AlignLeft, Search, Globe, Hash } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { SelectCustom } from '../components/ui/select-custom';
import { Dropdown } from '../components/ui/dropdown';
import RichTextEditor from '../components/RichTextEditor';
import { marked } from 'marked';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const ArticleEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [setIsLoading] = useState(!!id); // Nuovo: stato di caricamento iniziale
  const [saveMessage, setSaveMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const originalContentRef = useRef(''); // Nuovo: per il confronto delle immagini

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image_url: '', // Modificato: nome corretto
    category_id: '', // Modificato: nome corretto
    tags: [],
    published: false, // Modificato: tipo e nome corretti
    published_at: null, // Nuovo: per la programmazione
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([
    'Alternative Thinking',
    'Investments',
    'Personal Finance'
  ]);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const categoriesRes = await fetch('/api/categories');
        const categoriesData = await categoriesRes.json();
        // Adatta le categorie al formato richiesto dal tuo dropdown
        setCategories(categoriesData.categories.map(c => ({ value: c.id, label: c.name })) || []);
      } catch {
        toast.error('Failed to load categories.');
      }

      if (id) {
        setIsLoading(true);
        try {
          const articleRes = await fetch(`/api/articles/id/${id}`);
          if (!articleRes.ok) throw new Error('Article not found');

          const { article } = await articleRes.json();

          setFormData({
            title: article.title || '',
            content: article.content || '',
            excerpt: article.excerpt || '',
            image_url: article.image_url || '',
            category_id: article.category_id || '',
            tags: [], // Popola se hai i tag nel DB
            published: article.published || false,
            published_at: article.published_at || null,
            // ... campi SEO se presenti nel DB
          });
          originalContentRef.current = article.content || '';
        } catch (error) {
          toast.error(error.message);
          navigate('/admin/articles');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleAddCategory = () => {
    if (newCategoryInput.trim() && !categories.includes(newCategoryInput.trim())) {
      setCategories(prev => [...prev, newCategoryInput.trim()]);
      setNewCategoryInput('');
      // TODO: Save to backend
    }
  };

  const handleRemoveCategory = (categoryIdToRemove) => {
    if (categories.length > 1) {
      // Filtra in base all'ID (cat.value)
      setCategories(prev => prev.filter(cat => cat.value !== categoryIdToRemove));
      // TODO: Chiama l'API di backend per cancellare la categoria con l'ID
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    // Ho rimosso il controllo su 'subtitle' perché non è nel DB
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (publishAction) => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving.');
      return;
    }
    setIsSaving(true);
    setSaveMessage('Saving...');

    const extractImageUrls = (markdown) => {
      if (!markdown) return [];
      const regex = /!\[.*?\]\((.*?)\)/g;
      return Array.from(markdown.matchAll(regex), match => match[1]);
    };

    const originalUrls = new Set(extractImageUrls(originalContentRef.current));
    const currentUrls = new Set(extractImageUrls(formData.content));
    const images_to_delete = [];
    originalUrls.forEach(url => {
      if (!currentUrls.has(url)) {
        images_to_delete.push(url);
      }
    });

    const payload = { ...formData, images_to_delete };

    if (publishAction === 'published') {
        payload.published = true;
        if (!payload.published_at || new Date(payload.published_at) <= new Date()) {
            payload.published_at = new Date().toISOString();
        }
    } else {
        payload.published = false;
    }

    try {
      const url = id ? `/api/articles/${id}` : '/api/articles';
      const method = id ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save article.');
      toast.success(result.message || 'Article saved successfully!');
      setTimeout(() => navigate('/admin/articles'), 1500);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
      setSaveMessage('');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, image_url: previewUrl }));

    const uploadData = new FormData();
    uploadData.append('image', file);
    // Se stai creando un nuovo articolo, non hai uno slug.
    // L'API deve gestire questo caso o devi passare un ID temporaneo.
    // Per ora, presumiamo che l'API non richieda lo slug per l'upload.

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: uploadData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setFormData(prev => ({ ...prev, image_url: result.url }));
      toast.success('Cover image uploaded.');
    } catch (error) {
      toast.error(`Image upload failed: ${error.message}`);
      setFormData(prev => ({ ...prev, image_url: '' }));
    }
  };

  if (showPreview) {
    // Render markdown with LaTeX support
    const renderContent = () => {
      const contentWithLatex = (formData.content || '').replace(
        /\$\$([^$]+)\$\$/g,
        (match, latex) => {
          try {
            return katex.renderToString(latex, {
              throwOnError: false,
              displayMode: true,
            });
          } catch {
            return match;
          }
        },
      );

      const finalHtml = marked(contentWithLatex);
      return { __html: finalHtml };
    };

    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-input-gray bg-white">
          <div className="max-w-7xl mx-auto px-[1rem] sm:px-[1.5rem] lg:px-[2rem] py-[1rem]">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setShowPreview(false)} className="gap-[0.5rem]">
                <ArrowLeft className="w-[1rem] h-[1rem]" />
                Back to Editor
              </Button>
              <Badge variant="outline" className="bg-light-gray text-antracite">Preview Mode</Badge>
            </div>
          </div>
        </div>
        <div className="max-w-[1rem]xl mx-auto px-[1rem] sm:px-[1.5rem] lg:px-[2rem] py-[3rem]">
          {formData.image_url && (
            <img src={formData.image_url} alt={formData.title} className="w-full h-[24rem] object-cover rounded-lg mb-[2rem]" />
          )}
          <div className="space-y-6">
            <div>
              <Badge variant="border-input-gray" className="mb-[1rem]">{formData.category_id}</Badge>
              <h1 className="text-4xl font-bold text-antracite mb-[1rem]">{formData.title || 'Untitled Article'}</h1>
              {formData.subtitle && (
                <p className="text-xl text-dark-gray mb-[1.5rem]">{formData.subtitle}</p>
              )}
              <div className="flex items-center gap-[1rem] text-sm text-gray">
                <span>{formData.publishDate || 'No date set'}</span>
                <span>•</span>
                <span>5 min read</span>
              </div>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-[0.5rem]">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}
            <style>
              {`
                .article-preview-content { padding: 1rem 0; color: hsl(var(--foreground)); }
                .article-preview-content h1, .article-preview-content h2, .article-preview-content h3 { margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: 600; line-height: 1.3; }
                .article-preview-content h1 { font-size: 2rem; }
                .article-preview-content h2 { font-size: 1.75rem; }
                .article-preview-content h3 { font-size: 1.5rem; }
                .article-preview-content p { margin-bottom: 1rem; line-height: 1.7; }
                .article-preview-content ul, .article-preview-content ol { margin-left: 1.5rem; padding-left: 1.5rem; margin-bottom: 1rem; }
                .article-preview-content ul { list-style-type: disc; }
                .article-preview-content ol { list-style-type: decimal; }
                .article-preview-content li { margin-bottom: 0.5rem; }
                .article-preview-content blockquote { border-left: 3px solid hsl(var(--border)); padding-left: 1rem; margin-left: 0; margin-bottom: 1rem; font-style: italic; color: hsl(var(--muted-foreground)); }
                .article-preview-content code { background: hsl(var(--muted)); padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-size: 0.875em; }
                .article-preview-content pre { background: hsl(var(--muted)); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1rem; }
                .article-preview-content pre code { background: none; padding: 0; }
                .article-preview-content img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1.5rem 0; }
                .article-preview-content a { color: hsl(var(--primary)); text-decoration: underline; }
              `}
            </style>
            <div
              className="article-preview-content prose prose-lg max-w-none"
              dangerouslySetInnerHTML={renderContent()}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Same style as Contact Page */}
      <div className="bg-white">
        <div className="max-w-[1012px] mx-auto px-[1rem] pt-[3rem]">
          <div className="border-b border-input-gray my-[0.5rem]"></div>
          <h2 className="text-2xl font-regular text-antracite mb-[2rem]">{id ? 'Edit Article' : 'New Article'}</h2>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-[1012px] mx-auto px-[1rem] pb-[2rem]">
        <div className="flex items-start gap-[1rem]">
          {/* Back Button - Filter style */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/admin/my-articles');
            }}
            className="flex items-center gap-[0.75rem] text-sm group py-[0.375rem] transition-colors duration-150 text-antracite hover:text-blue"
          >
            <ArrowRight
              className="w-[1rem] h-[1rem] transition-all duration-150 rotate-180 group-hover:text-blue group-hover:-translate-x-1 text-dark-gray"
            />
            <span>Back</span>
          </a>

          {/* Action Buttons - Right side */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-[0.75rem] ml-auto">
            <Button 
              variant="outline-blue" 
              onClick={() => setShowPreview(true)} 
              className="gap-[0.5rem] w-full sm:w-auto min-h-[44px]"
            >
              <Eye className="w-[1rem] h-[1rem]" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
            <Button 
              variant="outline-red" 
              onClick={() => handleSave('draft')} 
              disabled={isSaving} 
              className="gap-[0.5rem] w-full sm:w-auto min-h-[44px]"
            >
              <Save className="w-[1rem] h-[1rem]" />
              <span className="hidden sm:inline">Save Draft</span>
            </Button>
            <Button 
              variant="outline-green" 
              onClick={() => handleSave('published')} 
              disabled={isSaving} 
              className="gap-[0.5rem] w-full sm:w-auto min-h-[44px]"
            >
              <Upload className="w-[1rem] h-[1rem]" />
              <span className="hidden sm:inline">{isSaving ? 'Publishing...' : 'Publish'}</span>
              <span className="sm:hidden">{isSaving ? '...' : 'Publish'}</span>
            </Button>
          </div>
        </div>
        {saveMessage && (
          <Alert className="mt-[1rem] bg-light-gray border-light-gray-border">
            <AlertCircle className="h-[1rem] w-[1rem]" />
            <AlertDescription>{saveMessage}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="max-w-[1012px] mx-auto px-[1rem] py-[2rem]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-[2rem]">
          <div className="space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-[0.5rem]">
                <FileText className="w-[1rem] h-[1rem] text-blue" />
                Title *
              </Label>
              <Input 
                id="title" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange} 
                placeholder="Enter article title" 
                className={errors.title ? 'border-red' : ''} 
              />
              {errors.title && <p className="text-sm text-red">{errors.title}</p>}
            </div>

            {/* Subtitle Field */}
            <div className="space-y-2">
              <Label htmlFor="subtitle" className="flex items-center gap-[0.5rem]">
                <Heading className="w-[1rem] h-[1rem] text-blue" />
                Subtitle *
              </Label>
              <Input 
                id="subtitle" 
                name="subtitle" 
                value={formData.subtitle} 
                onChange={handleInputChange} 
                placeholder="Enter article subtitle" 
                className={errors.subtitle ? 'border-red' : ''}
              />
              {errors.subtitle && <p className="text-sm text-red">{errors.subtitle}</p>}
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label className="flex items-center gap-[0.5rem]">
                <ImageIcon className="w-[1rem] h-[1rem] text-blue" />
                Cover Image
              </Label>
              {formData.image_url ? (
                <div className="relative">
                  <img src={formData.image_url} alt="Cover" className="w-full h-[16rem] object-cover rounded-lg" />
                  <Button variant="red" size="sm" onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))} className="absolute top-[0.5rem] right-[0.5rem]">
                    <X className="w-[1rem] h-[1rem]" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-[16rem] border-2 border-dashed border-input-gray rounded-lg cursor-pointer hover:border-input-gray transition-colors">
                  <Image className="w-[3rem] h-[3rem] text-gray mb-[1rem]" />
                  <span className="text-sm text-gray">Click to upload cover image</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Content Field */}
            <div className="space-y-2">
              <Label htmlFor="content" className="flex items-center gap-[0.5rem]">
                <AlignLeft className="w-[1rem] h-[1rem] text-blue" />
                Content *
              </Label>
              <RichTextEditor
                value={formData.content}
                onChange={(newContent) => {
                  setFormData(prev => ({ ...prev, content: newContent }));
                  if (errors.content) {
                    setErrors(prev => ({ ...prev, content: '' }));
                  }
                }}
                placeholder="Write your article content..."
                height="500px"
              />
              {errors.content && <p className="text-sm text-red">{errors.content}</p>}
            </div>

            {/* Excerpt Field */}
            <div className="space-y-2">
              <Label htmlFor="excerpt" className="flex items-center gap-[0.5rem]">
                <AlignLeft className="w-[1rem] h-[1rem] text-gray" />
                Excerpt (Optional)
              </Label>
              <Textarea 
                id="excerpt" 
                name="excerpt" 
                value={formData.excerpt} 
                onChange={handleInputChange} 
                placeholder="Brief summary of the article..." 
                rows={3} 
              />
            </div>
          </div>

          <div className="space-y-6">
            {/* Status Settings */}
            <Card className="shadow-none">
              <CardContent className="p-[1.5rem] space-y-4">
                <div className="flex items-center gap-[0.5rem] text-antracite font-semibold">
                  <Calendar className="w-[1.25rem] h-[1.25rem] text-blue" />
                  <span>Status</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status-dropdown">Article Status</Label>
                  <Dropdown
                    id="status-dropdown"
                    // Questo dropdown non ha un 'name' perché non aggiorna direttamente un campo,
                    // ma gestisce la logica per più campi.

                    // Determina quale opzione mostrare come selezionata
                    value={
                      !formData.published ? 'draft' :
                      (formData.published_at && new Date(formData.published_at) > new Date()) ? 'scheduled' :
                      'published'
                    }

                    // Logica per aggiornare gli stati quando l'utente sceglie un'opzione
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      if (newStatus === 'draft') {
                        setFormData(prev => ({ ...prev, published: false, published_at: null }));
                      } else if (newStatus === 'published') {
                        setFormData(prev => ({ ...prev, published: true, published_at: new Date().toISOString() }));
                      } else if (newStatus === 'scheduled') {
                        // Quando si sceglie "Scheduled", impostiamo 'published' a true
                        // e lasciamo che l'utente scelga una data futura.
                        // Se non c'è già una data futura, ne impostiamo una di default (es. domani).
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        setFormData(prev => ({
                          ...prev,
                          published: true,
                          published_at: (prev.published_at && new Date(prev.published_at) > new Date()) ? prev.published_at : tomorrow.toISOString()
                        }));
                      }
                    }}

                    options={[
                      { value: 'draft', label: 'Draft' },
                      { value: 'published', label: 'Publish Now' },
                      { value: 'scheduled', label: 'Schedule for Later' },
                    ]}
                    placeholder="Select status"
                  />
                </div>

                {/* Mostra il campo della data solo se lo stato è 'Published' o 'Scheduled' */}
                {formData.published && (
                  <div className="space-y-2 pt-[1rem] border-t border-input-gray">
                    <Label htmlFor="published_at">Publish Date & Time</Label>
                    <Input
                      id="published_at"
                      name="published_at"
                      type="datetime-local"
                      // Formatta la data per l'input type="datetime-local"
                      value={formData.published_at ? formData.published_at.substring(0, 16) : ''}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-gray">
                      Set a future date to schedule the article.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Settings */}
            <Card>
              <CardContent className="p-[1.5rem] space-y-4">
                <div className="flex items-center gap-[0.5rem] text-antracite font-semibold">
                  <Tag className="w-[1.25rem] h-[1.25rem] text-blue" />
                  <span>Category *</span>
                </div>
                <div className="space-y-2">
                  <Dropdown
                    id="category"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    options={categories} // Usa direttamente l'array di oggetti
                    placeholder="Select a category"
                    error={!!errors.category_id}
                  />
                  {errors.category_id && <p className="text-sm text-red">{errors.category_id}</p>}
                </div>

                {/* Categories Management */}
                <div className="space-y-2 pt-[0.75rem] border-t border-input-gray">
                  <Label className="text-xs text-gray">Manage Categories</Label>
                  <div className="flex flex-wrap gap-[0.5rem] mb-[0.5rem]">
                    {categories.map((cat) => (
                      <Badge 
                        key={cat.value} // Usa cat.value (l'ID) come chiave
                        variant="border-input-gray"
                        className="gap-[0.25rem] cursor-pointer hover:bg-red/10 hover:text-red"
                      >
                        {cat.label} {/* Usa cat.label (il nome) per visualizzare */}
                        {categories.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemoveCategory(cat.value); // Passa l'ID per la rimozione
                            }}
                            className="ml-[0.25rem]"
                          >
                            <X className="w-[0.75rem] h-[0.75rem]" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-[0.5rem]">
                    <Input 
                      value={newCategoryInput} 
                      onChange={(e) => setNewCategoryInput(e.target.value)} 
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())} 
                      placeholder="New category" 
                      className="text-sm"
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddCategory} 
                      size="sm" 
                      variant="outline"
                      className="flex-shrink-0"
                    >
                      <Plus className="w-[1rem] h-[1rem]" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags Section */}
            <Card>
              <CardContent className="p-[1.5rem] space-y-4">
                <div className="flex items-center gap-[0.5rem] text-antracite font-semibold">
                  <Hash className="w-[1.25rem] h-[1.25rem] text-blue" />
                  <span>Tags</span>
                </div>
                <div className="flex gap-[0.5rem]">
                  <Input 
                    value={tagInput} 
                    onChange={(e) => setTagInput(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())} 
                    placeholder="Add a tag" 
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddTag} 
                    size="sm" 
                    variant="outline"
                    className="flex-shrink-0"
                  >
                    <Plus className="w-[1rem] h-[1rem]" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-[0.5rem]">
                  {formData.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="border-input-gray" 
                      className="gap-[0.25rem] cursor-pointer hover:bg-red hover:text-light-gray" 
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag}
                      <X className="w-[0.75rem] h-[0.75rem]" />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardContent className="p-[1.5rem] space-y-4">
                <div className="flex items-center gap-[0.5rem] text-antracite font-semibold">
                  <Search className="w-[1.25rem] h-[1.25rem] text-blue" />
                  <span>SEO Settings</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoTitle" className="flex items-center gap-[0.5rem]">
                    <Globe className="w-[0.875rem] h-[0.875rem] text-gray" />
                    SEO Title
                  </Label>
                  <Input 
                    id="seoTitle" 
                    name="seoTitle" 
                    value={formData.seoTitle} 
                    onChange={handleInputChange} 
                    placeholder="SEO optimized title" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescription" className="flex items-center gap-[0.5rem]">
                    <AlignLeft className="w-[0.875rem] h-[0.875rem] text-gray" />
                    SEO Description
                  </Label>
                  <Textarea 
                    id="seoDescription" 
                    name="seoDescription" 
                    value={formData.seoDescription} 
                    onChange={handleInputChange} 
                    placeholder="Meta description for search engines" 
                    rows={3} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoKeywords" className="flex items-center gap-[0.5rem]">
                    <Hash className="w-[0.875rem] h-[0.875rem] text-gray" />
                    SEO Keywords
                  </Label>
                  <Input 
                    id="seoKeywords" 
                    name="seoKeywords" 
                    value={formData.seoKeywords} 
                    onChange={handleInputChange} 
                    placeholder="keyword1, keyword2, keyword3" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditorPage;
