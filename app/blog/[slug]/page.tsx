'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  seoTitle: string;
  seoDesc: string;
  publishedAt: string;
}

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>('');
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Resolve dynamic params Promise
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    async function loadPost() {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const res = await api.getBlogBySlug(slug);
        setPost(res);
      } catch (err: any) {
        setErrorMsg(err.message || 'Article not found');
      } finally {
        setIsLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  const renderContent = (content: string) => {
    // Basic Markdown parser helper to convert headers and paragraphs
    return content.split('\n\n').map((block, idx) => {
      if (block.startsWith('# ')) {
        return <h1 key={idx} className="font-display font-bold text-3xl text-white mt-8 mb-4">{block.slice(2)}</h1>;
      }
      if (block.startsWith('## ')) {
        return <h2 key={idx} className="font-display font-bold text-2xl text-white mt-6 mb-3">{block.slice(3)}</h2>;
      }
      return <p key={idx} className="text-gray-300 text-sm md:text-base leading-relaxed mb-4">{block}</p>;
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="border-b border-white/10 pb-6 space-y-4">
        <Link href="/blog" className="text-ecoGreen-400 hover:text-ecoGreen-300 text-xs font-semibold">
          ← Back to Publications
        </Link>
        
        {post && (
          <div className="space-y-2">
            <span className="text-[10px] text-gray-500">
              Published: {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white leading-tight">
              {post.title}
            </h1>
            <p className="text-xs text-gray-400 italic">{post.seoDesc}</p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center text-xs text-gray-500 py-12">Loading article content...</div>
      ) : errorMsg ? (
        <div className="text-center text-red-400 text-xs py-12">{errorMsg}</div>
      ) : post ? (
        <article className="prose prose-invert max-w-none pt-4">
          {renderContent(post.content)}
        </article>
      ) : null}
    </div>
  );
}
