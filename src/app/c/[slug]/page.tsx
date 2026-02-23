import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SubmitForm } from '@/components/SubmitForm'

export default async function SubmitTestimonialPage({ params }: { params: { slug: string } }) {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
    select: { id: true, name: true, slug: true }
  })

  if (!project) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Share your experience with {project.name}
          </h1>
          <p className="text-gray-600">We'd love to hear what you think!</p>
        </div>

        <SubmitForm slug={project.slug} />

        <p className="text-center text-gray-500 text-sm mt-4">
          Powered by <span className="text-indigo-600 font-medium">TestiMonial</span>
        </p>
      </div>
    </div>
  )
}
