'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  seoDesc: string;
  publishedAt: string;
}

export default function BlogListingPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadBlogs() {
      setIsLoading(true);
      try {
        const res = await api.getBlogs();
        setPosts(res || []);
      } catch (err) {
        console.error('Failed to load blog posts:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBlogs();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-[#FAF8F5]">
      {/* Title (Deep Green Banner) */}
      <div className="text-center max-w-5xl mx-auto space-y-3 bg-[#061C0F] text-white p-12 rounded-3xl relative overflow-hidden shadow-xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-amber-500/5 pointer-events-none" />
        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full relative z-10">
          Knowledge Hub
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold relative z-10 leading-[1.2]">
          EcoFone <span className="gradient-text-green">Knowledge Hub</span>
        </h1>
        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto relative z-10">
          Industry insights, sustainability news, and tips on buying/selling refurbished electronics.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center text-xs text-slate-500 py-10">Fetching publications feed...</div>
      ) : !posts.length ? (
        <div className="text-center text-xs text-slate-500 py-10">No publications found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col justify-between group shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <span className="text-[10px] text-slate-400 font-semibold block">
                  Published: {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{post.seoDesc}</p>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-emerald-600 hover:text-emerald-700 font-bold text-xs transition-colors flex items-center gap-1"
                >
                  Read Article →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
