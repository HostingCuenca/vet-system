import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const veterinarians = await prisma.user.findMany({
      where: {
        role: 'VETERINARIAN',
        active: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(veterinarians)

  } catch (error) {
    console.error('Error fetching veterinarians:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}