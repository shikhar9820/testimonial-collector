import Link from 'next/link'
import { getProjects, createProject } from '@/lib/actions'
import { CreateProjectButton } from '@/components/CreateProjectButton'

export default async function DashboardPage() {
  const projects = await getProjects()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <CreateProjectButton />
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-4">Create your first project to start collecting testimonials.</p>
          <CreateProjectButton />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/project/${project.id}`}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
              {project.website && (
                <p className="text-gray-500 text-sm mb-4">{project.website}</p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {project._count.testimonials} testimonials
                </span>
                <span className="text-indigo-600">View →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
