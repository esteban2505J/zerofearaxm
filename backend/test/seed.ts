import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  try {
    // Limpiar base de datos
    await prisma.productVariant.deleteMany({});
    await prisma.productImage.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});

    // Crear categorías
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
      },
    });

    console.log('Database seeded successfully');
    console.log('Created category:', category);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
