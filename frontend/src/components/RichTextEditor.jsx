// LitInvestorBlog-frontend/src/components/RichTextEditor.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { marked } from 'marked';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Badge } from './ui/badge';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  Edit,
  Type,
  Calculator,
  Divide,
  Radical,
  Sigma,
  Infinity as InfinityIcon,
  Grid3x3,
  TrendingUp,
  FunctionSquare,
} from 'lucide-react';
import { toast } from 'sonner';

const RichTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Scrivi il tuo articolo...',
  height = '400px',
}) => {
  const [content, setContent] = useState(value);
  const [activeTab, setActiveTab] = useState('edit');
  const textareaRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading('Caricamento immagine in corso...');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Caricamento fallito');
      }

      const data = await response.json();
      const backendUrl = 'http://localhost:5000';
      const fullImageUrl = backendUrl + data.url;

      const markdownImage = `\n![${file.name}](${fullImageUrl})\n`;
      insertAtCursor(markdownImage);

      toast.success('Immagine caricata con successo!', { id: toastId });
    } catch (error) {
      toast.error(`Errore: ${error.message}`, { id: toastId });
      console.error(error);
    } finally {
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleContentChange = (newContent) => {
    setContent(newContent);
    onChange?.(newContent);
  };

  const insertText = (before, after = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const newContent =
      content.substring(0, start) +
      before +
      textToInsert +
      after +
      content.substring(end);

    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertAtCursor = (text) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newContent =
      content.substring(0, start) + text + content.substring(end);

    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + text.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toolbarButtons = [
    {
      icon: Bold,
      label: 'Grassetto',
      action: () => insertText('**', '**', 'testo in grassetto'),
    },
    {
      icon: Italic,
      label: 'Corsivo',
      action: () => insertText('*', '*', 'testo in corsivo'),
    },
    {
      icon: Underline,
      label: 'Sottolineato',
      action: () => insertText('<u>', '</u>', 'testo sottolineato'),
    },
    {
      icon: Heading1,
      label: 'Titolo H1',
      action: () => insertAtCursor('\n# Titolo principale\n'),
    },
    {
      icon: Heading2,
      label: 'Titolo H2',
      action: () => insertAtCursor('\n## Sottotitolo\n'),
    },
    {
      icon: Heading3,
      label: 'Titolo H3',
      action: () => insertAtCursor('\n### Titolo sezione\n'),
    },
    {
      icon: List,
      label: 'Lista puntata',
      action: () => insertAtCursor('\n- Elemento lista\n- Altro elemento\n'),
    },
    {
      icon: ListOrdered,
      label: 'Lista numerata',
      action: () =>
        insertAtCursor('\n1. Primo elemento\n2. Secondo elemento\n'),
    },
    {
      icon: Link,
      label: 'Link',
      action: () => insertText('[', '](https://esempio.com)', 'testo del link'),
    },
    {
      icon: Image,
      label: 'Immagine',
      action: () => imageInputRef.current?.click(),
    },
    {
      icon: Code,
      label: 'Codice inline',
      action: () => insertText('`', '`', 'codice'),
    },
    {
      icon: Quote,
      label: 'Citazione',
      action: () => insertAtCursor('\n> Questa è una citazione\n'),
    },
    {
      icon: Calculator,
      label: 'Formula LaTeX',
      action: () =>
        insertText('$$', '$$', 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}'),
    },
  ];

  const latexTemplates = [
    { key: 'fraction', label: 'Frazione', icon: Divide },
    { key: 'sqrt', label: 'Radice', icon: Radical },
    { key: 'integral', label: 'Integrale', icon: TrendingUp },
    { key: 'sum', label: 'Sommatoria', icon: Sigma },
    { key: 'limit', label: 'Limite', icon: InfinityIcon },
    { key: 'matrix', label: 'Matrice', icon: Grid3x3 },
    { key: 'derivative', label: 'Derivata', icon: FunctionSquare },
    { key: 'partial', label: 'Parziale', icon: FunctionSquare },
  ];

  const renderPreview = () => {
    const contentWithLatex = (content || '').replace(
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

  const insertLatexTemplate = (template) => {
    const templates = {
      fraction: '\\frac{numeratore}{denominatore}',
      sqrt: '\\sqrt{valore}',
      integral: '\\int_{a}^{b} f(x) dx',
      sum: '\\sum_{i=1}^{n} x_i',
      limit: '\\lim_{x \\to \\infty} f(x)',
      matrix: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
      derivative: '\\frac{d}{dx} f(x)',
      partial: '\\frac{\\partial f}{\\partial x}',
    };

    insertText('$$', '$$', templates[template]);
  };

  return (
    <div className="border border-input-gray rounded-lg">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleImageUpload}
      />

      <div className="p-[1.5rem] border-b border-input-gray">
        <div className="flex items-center gap-[0.5rem]">
          <Edit className="w-[1.25rem] h-[1.25rem] text-blue" />
          <span className="font-semibold">Editor Articolo</span>
        </div>
      </div>
      <div className="p-[1.5rem]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent p-[0rem] w-full border-b border-input-gray mb-[1.5rem] shadow-none">
            <TabsTrigger
              value="edit"
              className="text-dark-gray data-[state=active]:text-blue data-[state=active]:border-b-2 data-[state=active]:border-blue rounded-none px-[1rem] pb-[0.75rem] shadow-none"
            >
              <Edit className="w-[1rem] h-[1rem] mr-[0.5rem]" />
              <span>Modifica</span>
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="text-dark-gray data-[state=active]:text-blue data-[state=active]:border-b-2 data-[state=active]:border-blue rounded-none px-[1rem] pb-[0.75rem] shadow-none"
            >
              <Eye className="w-[1rem] h-[1rem] mr-[0.5rem]" />
              <span>Anteprima</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4 mt-[1rem]">
            {/* Formatting Toolbar */}
            <div className="border-b border-input-gray pb-[1rem]">
              <div className="flex items-center gap-[0.5rem] mb-[0.75rem]">
                <Type className="w-[1rem] h-[1rem] text-blue" />
                <span className="text-sm font-semibold text-antracite">Formattazione</span>
              </div>
              <div className="flex flex-wrap gap-[0.25rem]">
                {toolbarButtons.map((button, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={button.action}
                    title={button.label}
                    className="h-[2.25rem] w-[2.25rem] p-[0rem] hover:bg-light-gray hover:text-blue"
                  >
                    <button.icon className="w-[1rem] h-[1rem]" />
                  </Button>
                ))}
              </div>
            </div>

            {/* LaTeX Templates Section */}
            <div className="border-b border-input-gray pb-[1rem]">
              <div className="flex items-center gap-[0.5rem] mb-[0.75rem]">
                <Calculator className="w-[1rem] h-[1rem] text-blue" />
                <span className="text-sm font-semibold text-antracite">Template LaTeX</span>
              </div>
              <div className="flex flex-wrap gap-[0.5rem]">
                {latexTemplates.map((template) => (
                  <Button
                    key={template.key}
                    variant="outline"
                    size="sm"
                    onClick={() => insertLatexTemplate(template.key)}
                    className="text-xs h-[2rem] px-[0.75rem] gap-[0.375rem]"
                    title={template.label}
                  >
                    <template.icon className="w-[0.875rem] h-[0.875rem]" />
                    {template.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Text Editor */}
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={placeholder}
              className="font-mono resize-none shadow-none focus-visible:ring-0 border-input-gray"
              style={{ height }}
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-[1rem]">
            <style>
              {`
                .preview-content { 
                  padding: 1.5rem; 
                  border: 1px solid hsl(var(--border)); 
                  border-radius: 0.5rem; 
                  min-height: 400px; 
                  background: hsl(var(--background)); 
                  color: hsl(var(--foreground)); 
                }
                .preview-content h1, .preview-content h2, .preview-content h3 { 
                  margin-top: 1.5rem; 
                  margin-bottom: 0.75rem; 
                  font-weight: 600; 
                  line-height: 1.3; 
                  color: hsl(var(--foreground));
                }
                .preview-content h1 { font-size: 2rem; }
                .preview-content h2 { font-size: 1.75rem; }
                .preview-content h3 { font-size: 1.5rem; }
                .preview-content p { margin-bottom: 1rem; line-height: 1.7; }
                .preview-content ul, .preview-content ol { 
                  margin-left: 1.5rem; 
                  padding-left: 1.5rem; 
                  margin-bottom: 1rem; 
                }
                .preview-content ul { list-style-type: disc; }
                .preview-content ol { list-style-type: decimal; }
                .preview-content li { margin-bottom: 0.5rem; }
                .preview-content blockquote { 
                  border-left: 3px solid hsl(var(--border)); 
                  padding-left: 1rem; 
                  margin-left: 0; 
                  margin-bottom: 1rem; 
                  font-style: italic; 
                  color: hsl(var(--muted-foreground)); 
                }
                .preview-content code { 
                  background: hsl(var(--muted)); 
                  padding: 0.2rem 0.4rem; 
                  border-radius: 0.25rem; 
                  font-size: 0.875em; 
                  font-family: monospace;
                }
                .preview-content pre { 
                  background: hsl(var(--muted)); 
                  padding: 1rem; 
                  border-radius: 0.5rem; 
                  overflow-x: auto; 
                  margin-bottom: 1rem; 
                }
                .preview-content pre code { 
                  background: none; 
                  padding: 0; 
                }
                .preview-content img { 
                  max-width: 100%; 
                  height: auto; 
                  border-radius: 0.5rem; 
                  margin: 1.5rem 0; 
                }
                .preview-content a { 
                  color: hsl(var(--primary)); 
                  text-decoration: underline; 
                }
                .preview-content a:hover { 
                  opacity: 0.8; 
                }
              `}
            </style>
            <div
              className="preview-content"
              dangerouslySetInnerHTML={renderPreview()}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RichTextEditor;

