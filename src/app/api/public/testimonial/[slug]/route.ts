import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const body = await request.json()
    const { name, email, company, role, content, rating } = body

    if (!name || !content) {
      return NextResponse.json(
        { error: 'Name and testimonial content are required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        user: true,
        _count: { select: { testimonials: true } }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check testimonial limit for free plan
    if (project.user.plan === 'free' && project._count.testimonials >= 5) {
      return NextResponse.json(
        { error: 'This project has reached its testimonial limit' },
        { status: 403 }
      )
    }

    await prisma.testimonial.create({
      data: {
        projectId: project.id,
        name,
        email: email || null,
        company: company || null,
        role: role || null,
        content,
        rating: rating ? parseInt(rating) : 5,
        status: 'pending'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your testimonial has been submitted.'
    })
  } catch (error) {
    console.error('Submit testimonial error:', error)
    return NextResponse.json(
      { error: 'Failed to submit testimonial' },
      { status: 500 }
    )
  }
}
