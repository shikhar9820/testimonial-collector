'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${base}-${randomUUID().slice(0, 6)}`
}

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  let dbUser = await prisma.user.findUnique({
    where: { visitorId: user.id }
  })

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        visitorId: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || null
      }
    })
  }

  return dbUser
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function getProjects() {
  const user = await getCurrentUser()
  if (!user) return []

  return prisma.project.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { testimonials: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createProject(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const name = formData.get('name') as string
  const website = formData.get('website') as string

  if (user.plan === 'free') {
    const count = await prisma.project.count({ where: { userId: user.id } })
    if (count >= 1) {
      throw new Error('Free plan limited to 1 project. Upgrade to create more.')
    }
  }

  await prisma.project.create({
    data: {
      name,
      slug: generateSlug(name),
      website: website || null,
      userId: user.id
    }
  })

  revalidatePath('/dashboard')
}

export async function getProject(id: string) {
  const user = await getCurrentUser()
  if (!user) return null

  return prisma.project.findFirst({
    where: { id, userId: user.id },
    include: {
      testimonials: { orderBy: { createdAt: 'desc' } }
    }
  })
}

export async function deleteProject(id: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const project = await prisma.project.findFirst({
    where: { id, userId: user.id }
  })

  if (!project) throw new Error('Project not found')

  await prisma.project.delete({ where: { id } })
  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function updateTestimonialStatus(id: string, status: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
    include: { project: true }
  })

  if (!testimonial || testimonial.project.userId !== user.id) {
    throw new Error('Testimonial not found')
  }

  await prisma.testimonial.update({
    where: { id },
    data: { status }
  })

  revalidatePath(`/dashboard/project/${testimonial.projectId}`)
}

export async function toggleFeatured(id: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
    include: { project: true }
  })

  if (!testimonial || testimonial.project.userId !== user.id) {
    throw new Error('Testimonial not found')
  }

  await prisma.testimonial.update({
    where: { id },
    data: { isFeatured: !testimonial.isFeatured }
  })

  revalidatePath(`/dashboard/project/${testimonial.projectId}`)
}

export async function deleteTestimonial(id: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
    include: { project: true }
  })

  if (!testimonial || testimonial.project.userId !== user.id) {
    throw new Error('Testimonial not found')
  }

  await prisma.testimonial.delete({ where: { id } })
  revalidatePath(`/dashboard/project/${testimonial.projectId}`)
}
