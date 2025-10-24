// LitInvestorBlog-frontend/src/pages/ArticleDetailPage.jsx
// ✅ VERSIONE OTTIMIZZATA PER MOBILE - DESKTOP INTATTO

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import SEO from '../components/SEO';
import Disclaimer from '../components/Disclaimer';
import RelatedArticles from '../components/RelatedArticles';
import ShareLinks from '../components/ShareLinks';
import ArticleContacts from '../components/ArticleContacts';
import ArticleActions from '../components/ArticleActions';
import CommentSection from '../components/CommentSection';

const ArticleDetailPage = () => {
  const {slug} = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/articles/${slug}`);
        if (!response.ok) throw new Error('Article not found');
        const data = await response.json();
        setArticle(data.article);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchArticle();
  }, [slug]);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', {locale: enUS});
    } catch {
      return '';
    }
  };

  if (loading)
    return (
        <div className="bg-white text-center py-[3rem] sm:py-[5rem] text-dark-gray">Loading article...</div>
    );
  if (!article)
    return (
        <div className="bg-white text-center py-[3rem] sm:py-[5rem] text-dark-gray">Article not found.</div>
    );

  return (
      <div className="bg-white">
        {/* SEO Component - Complete Article Metadata */}
        <SEO 
          title={article.title}
          description={article.excerpt || article.title}
          type="article"
          image={article.image_url}
          keywords={article.tags || [article.category_name, 'finance', 'investing']}
          article={{
            publishedTime: article.created_at,
            modifiedTime: article.updated_at || article.created_at,
            author: article.author_name,
            section: article.category_name,
            tags: article.tags || [article.category_name],
          }}
          author={{
            name: article.author_name,
            url: `/author/${article.author_id}`,
          }}
          breadcrumbs={[
            { name: 'Home', url: '/' },
            { name: article.category_name, url: `/category/${article.category_slug || article.category_id}` },
            { name: article.title, url: `/article/${article.slug}` },
          ]}
        />

        {/* ===== CONTENITORE 1: SOLO PER L'ARTICOLO ===== */}
        <div className="container mx-auto pt-[2rem] sm:pt-[2.5rem] md:pt-[3rem] px-[2rem] md:px-[1rem] smooth-padding">
          <article className="max-w-3xl mx-auto">
            <header className="mb-[1.5rem] sm:mb-[2rem]">
              <p className="text-xs sm:text-sm font-semibold text-dark-gray uppercase tracking-wider mb-[0.25rem]">
                {article.category_name}
              </p>
              <p className="text-sm sm:text-base text-dark-gray mb-[0.75rem] sm:mb-[1rem]">
                {formatDate(article.created_at)}
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold" style={{lineHeight: 1.4}}>
                {article.title}
              </h1>
              <div className="flex items-center justify-between my-[1.5rem] sm:my-[2rem] gap-[1rem]">
                <ShareLinks articleTitle={article.title}/>
                {article && (
                    <ArticleActions
                        article={{
                          ...article,
                          comments_count: commentsCount || article.comments_count || 0
                        }}
                    />
                )}
              </div>
              <div className="border-b border-input-gray"></div>
            </header>

            <div className="article-content article-content-mobile">
              <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    img: ({...props}) => (
                        <figure>
                          <img {...props} />
                          {props.alt && <figcaption>{props.alt}</figcaption>}
                        </figure>
                    ),
                  }}
              >
                {article.content}
              </ReactMarkdown>
            </div>

            <footer className="mt-[2rem] sm:mt-[2.5rem] md:mt-[3rem]">
              <h3 className="text-base sm:text-lg font-semibold text-left mb-[0.75rem] sm:mb-[1rem] text-antracite">
                Share Article
              </h3>
              <div className="mb-[1.5rem] sm:mb-[2rem]">
                <ShareLinks articleTitle={article.title}/>
              </div>
            </footer>

            <Disclaimer variant="gray"/>

            {article.show_author_contacts && (
                <ArticleContacts
                    name={article.author_name}
                    email={article.author_email}
                    linkedinUrl={article.author_linkedin_url}
                />
            )}
          </article>
        </div>
        {/* ===== FINE CONTENITORE 1 ===== */}


        {/* ===== SEZIONE COMMENTI (A PIENA LARGHEZZA) ===== */}
        <div className="mt-[3rem] sm:mt-[4rem]">
          <CommentSection
              articleId={article.id}
              onCommentsCountChange={setCommentsCount}
          />
        </div>


        {/* ===== CONTENITORE 2: SOLO PER GLI ARTICOLI CORRELATI ===== */}
        <div
            className="container mx-auto pt-[3rem] sm:pt-[4rem] pb-[2rem] sm:pb-[2.5rem] md:pb-[3rem] px-[2rem] md:px-[1rem] smooth-padding">
          <div className="max-w-3xl mx-auto">
            <RelatedArticles
                title="More from Lit Investor"
                fetchUrl={`/api/articles/?category_id=${article.category_id}&exclude_id=${article.id}&per_page=3`}
                variant="list"
                showButton={false}
            />
          </div>
        </div>
      </div>
  );
}

export default ArticleDetailPage;
