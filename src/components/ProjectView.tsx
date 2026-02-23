'use client'

import { useState } from 'react'
import {
  deleteProject,
  updateTestimonialStatus,
  toggleFeatured,
  deleteTestimonial
} from '@/lib/actions'

type Project = {
  id: string
  name: string
  slug: string
  website: string | null
  testimonials: {
    id: string
    name: string
    email: string | null
    company: string | null
    role: string | null
    content: string
    rating: number | null
    status: string
    isFeatured: boolean
  }[]
}

export function ProjectView({ project }: { project: Project }) {
  const [filter, setFilter] = useState('all')
  const [showEmbed, setShowEmbed] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL

  const collectionUrl = `${baseUrl}/c/${project.slug}`
  const embedCode = `<div id="testimonial-widget"></div>
<script src="${baseUrl}/api/widget/${project.slug}/embed.js"></script>`

  const filteredTestimonials = project.testimonials.filter((t) => {
    if (filter === 'all') return true
    return t.status === filter
  })

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.website && (
            <a href={project.website} className="text-gray-500 text-sm hover:underline">
              {project.website}
            </a>
          )}
        </div>
        <form action={() => deleteProject(project.id)}>
          <button type="submit" className="text-red-600 hover:text-red-700 text-sm">
            Delete Project
          </button>
        </form>
      </div>

      {/* Collection Link */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <h2 className="font-semibold mb-2">Collection Link</h2>
        <p className="text-sm text-gray-600 mb-3">Share this link with your customers to collect testimonials</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={collectionUrl}
            readOnly
            className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={() => navigator.clipboard.writeText(collectionUrl)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Embed Code */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">Embed Widget</h2>
          <button
            onClick={() => setShowEmbed(!showEmbed)}
            className="text-indigo-600 text-sm"
          >
            {showEmbed ? 'Hide' : 'Show'} Code
          </button>
        </div>
        {showEmbed && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Add this code to your website to display approved testimonials</p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              {embedCode}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(embedCode)}
              className="mt-2 text-indigo-600 text-sm hover:underline"
            >
              Copy embed code
            </button>
          </div>
        )}
      </div>

      {/* Testimonials */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-semibold">Testimonials ({project.testimonials.length})</h2>
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-sm capitalize ${
                  filter === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredTestimonials.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No testimonials yet. Share your collection link to get started!
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTestimonials.map((t) => (
              <div key={t.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium">{t.name}</span>
                    {t.role && t.company && (
                      <span className="text-gray-500 text-sm ml-2">
                        {t.role} at {t.company}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      t.status === 'approved' ? 'bg-green-100 text-green-700' :
                      t.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {t.status}
                    </span>
                    {t.isFeatured && (
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 mb-3">"{t.content}"</p>
                <div className="flex gap-2 text-sm">
                  {t.status !== 'approved' && (
                    <form action={() => updateTestimonialStatus(t.id, 'approved')}>
                      <button type="submit" className="text-green-600 hover:underline">
                        Approve
                      </button>
                    </form>
                  )}
                  {t.status !== 'rejected' && (
                    <form action={() => updateTestimonialStatus(t.id, 'rejected')}>
                      <button type="submit" className="text-red-600 hover:underline">
                        Reject
                      </button>
                    </form>
                  )}
                  <form action={() => toggleFeatured(t.id)}>
                    <button type="submit" className="text-purple-600 hover:underline">
                      {t.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                  </form>
                  <form action={() => deleteTestimonial(t.id)}>
                    <button type="submit" className="text-gray-500 hover:underline">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
