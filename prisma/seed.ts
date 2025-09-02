import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash password for all test users (password: "123456")
  const hashedPassword = await bcrypt.hash('123456', 10)

  // Create test users for each role
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vetclinic.com' },
    update: {},
    create: {
      email: 'admin@vetclinic.com',
      passwordHash: hashedPassword,
      name: 'Dr. Admin Sistema',
      role: 'ADMIN',
      phone: '+57 300 123 4567',
      active: true,
    },
  })

  const veterinarian = await prisma.user.upsert({
    where: { email: 'veterinario@vetclinic.com' },
    update: {},
    create: {
      email: 'veterinario@vetclinic.com',
      passwordHash: hashedPassword,
      name: 'Dr. María Veterinaria',
      role: 'VETERINARIAN',
      phone: '+57 301 234 5678',
      active: true,
    },
  })

  const receptionist = await prisma.user.upsert({
    where: { email: 'recepcionista@vetclinic.com' },
    update: {},
    create: {
      email: 'recepcionista@vetclinic.com',
      passwordHash: hashedPassword,
      name: 'Ana Recepcionista',
      role: 'RECEPTIONIST',
      phone: '+57 302 345 6789',
      active: true,
    },
  })

  // Create some test owners
  const owner1 = await prisma.owner.upsert({
    where: { identificationNumber: '12345678' },
    update: {},
    create: {
      name: 'Juan Pérez',
      identificationNumber: '12345678',
      phone: '+57 310 111 2222',
      email: 'juan@email.com',
      address: 'Calle 123 #45-67, Bogotá',
      notes: 'Cliente frecuente, muy cuidadoso con sus mascotas',
    },
  })

  const owner2 = await prisma.owner.upsert({
    where: { identificationNumber: '87654321' },
    update: {},
    create: {
      name: 'María García',
      identificationNumber: '87654321',
      phone: '+57 320 333 4444',
      email: 'maria@email.com',
      address: 'Carrera 88 #12-34, Medellín',
    },
  })

  // Create some test pets
  await prisma.pet.upsert({
    where: { internalId: 'P001' },
    update: {},
    create: {
      internalId: 'P001',
      name: 'Max',
      species: 'DOG',
      breed: 'Labrador Retriever',
      gender: 'MALE',
      color: 'Dorado',
      currentWeight: 32.5,
      ownerId: owner1.id,
      birthDate: new Date('2020-03-15'),
      notes: 'Muy activo y juguetón',
    },
  })

  await prisma.pet.upsert({
    where: { internalId: 'P002' },
    update: {},
    create: {
      internalId: 'P002',
      name: 'Luna',
      species: 'CAT',
      breed: 'Siamés',
      gender: 'FEMALE',
      color: 'Blanco y negro',
      currentWeight: 4.2,
      ownerId: owner2.id,
      birthDate: new Date('2021-07-22'),
      notes: 'Gata muy tranquila',
    },
  })

  // Create some product categories
  const medicineCategory = await prisma.productCategory.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Medicamentos',
      description: 'Medicamentos y fármacos veterinarios',
    },
  })

  const vaccineCategory = await prisma.productCategory.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Vacunas',
      description: 'Vacunas para diferentes especies',
    },
  })

  // Create some test products
  await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Amoxicilina 250mg',
      categoryId: medicineCategory.id,
      description: 'Antibiótico de amplio espectro',
      unitType: 'TABLETS',
      unitPrice: 1500.00,
      currentStock: 100,
      minimumStock: 20,
      requiresPrescription: true,
      supplier: 'Laboratorio Veterinario ABC',
    },
  })

  await prisma.product.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Vacuna Triple Canina',
      categoryId: vaccineCategory.id,
      description: 'Vacuna contra distemper, hepatitis y parvovirus',
      unitType: 'ML',
      unitPrice: 25000.00,
      currentStock: 50,
      minimumStock: 10,
      requiresPrescription: true,
      supplier: 'Laboratorio Veterinario XYZ',
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('\n👥 Test Users Created:')
  console.log('📧 admin@vetclinic.com (password: 123456) - ADMIN')
  console.log('📧 veterinario@vetclinic.com (password: 123456) - VETERINARIAN')
  console.log('📧 recepcionista@vetclinic.com (password: 123456) - RECEPTIONIST')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })