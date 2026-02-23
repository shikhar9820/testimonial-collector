import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const featured = searchParams.get('featured') === 'true'

    const project = await prisma.project.findUnique({
      where: { slug }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const where: any = {
      projectId: project.id,
      status: 'approved'
    }

    if (featured) {
      where.isFeatured = true
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      select: {
        id: true,
        name: true,
        company: true,
        role: true,
        content: true,
        rating: true,
        avatarUrl: true,
        createdAt: true
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    return NextResponse.json({
      project: { name: project.name },
      testimonials
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('Widget fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    )
  }
}
