import { notFound } from 'next/navigation'
import { getProject } from '@/lib/actions'
import { ProjectView } from '@/components/ProjectView'

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id)

  if (!project) {
    notFound()
  }

  return <ProjectView project={project} />
}
