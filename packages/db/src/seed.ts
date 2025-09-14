import { PrismaClient } from './generated';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Clearing existing data...');
    await prisma.orderItem.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.review.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.menuCategory.deleteMany();
    await prisma.table.deleteMany();
    await prisma.businessHours.deleteMany();
    await prisma.restaurantStaff.deleteMany();
    await prisma.restaurant.deleteMany();
    await prisma.session.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create sample restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'The Spice Garden',
      slug: 'the-spice-garden',
      description: 'Authentic Indian cuisine with a modern twist',
      phoneNumber: '+911234567890',
      email: 'contact@spicegarden.com',
      address: {
        street: '123 MG Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      },
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777
      },
      gstNumber: '27ABCDE1234F1Z5',
      fssaiLicense: '12345678901234',
      serviceChargePercentage: 10.0,
      settings: {
        acceptsOnlineOrders: true,
        minimumOrderAmount: 200,
        deliveryRadius: 5,
        estimatedDeliveryTime: 30
      }
    }
  });

  // Create business hours
  const businessHours = [
    { dayOfWeek: 1, openTime: '11:00', closeTime: '23:00' }, // Monday
    { dayOfWeek: 2, openTime: '11:00', closeTime: '23:00' }, // Tuesday
    { dayOfWeek: 3, openTime: '11:00', closeTime: '23:00' }, // Wednesday
    { dayOfWeek: 4, openTime: '11:00', closeTime: '23:00' }, // Thursday
    { dayOfWeek: 5, openTime: '11:00', closeTime: '23:30' }, // Friday
    { dayOfWeek: 6, openTime: '11:00', closeTime: '23:30' }, // Saturday
    { dayOfWeek: 0, openTime: '11:00', closeTime: '22:30' }, // Sunday
  ];

  for (const hours of businessHours) {
    await prisma.businessHours.create({
      data: {
        restaurantId: restaurant.id,
        ...hours
      }
    });
  }

  // Create tables
  const tables = [];
  for (let i = 1; i <= 20; i++) {
    const table = await prisma.table.create({
      data: {
        restaurantId: restaurant.id,
        tableNumber: `T${i.toString().padStart(2, '0')}`,
        capacity: Math.floor(Math.random() * 6) + 2, // 2-8 people
        qrCode: `QR_${restaurant.slug}_T${i.toString().padStart(2, '0')}`,
        position: {
          x: Math.floor(Math.random() * 10),
          y: Math.floor(Math.random() * 10)
        }
      }
    });
    tables.push(table);
  }

  // Create menu categories
  const categories = [
    { name: 'Appetizers', description: 'Start your meal with our delicious appetizers' },
    { name: 'Main Course', description: 'Hearty main dishes to satisfy your hunger' },
    { name: 'Rice & Biryani', description: 'Aromatic rice dishes and biryanis' },
    { name: 'Breads', description: 'Freshly baked Indian breads' },
    { name: 'Desserts', description: 'Sweet endings to your meal' },
    { name: 'Beverages', description: 'Refreshing drinks and traditional beverages' }
  ];

  const createdCategories = [];
  for (let i = 0; i < categories.length; i++) {
    const category = await prisma.menuCategory.create({
      data: {
        restaurantId: restaurant.id,
        name: categories[i].name,
        description: categories[i].description,
        sortOrder: i
      }
    });
    createdCategories.push(category);
  }

  // Create menu items
  const menuItems = [
    // Appetizers
    { categoryIndex: 0, name: 'Samosa', description: 'Crispy pastry filled with spiced potatoes', price: 80, isVegetarian: true },
    { categoryIndex: 0, name: 'Chicken Tikka', description: 'Grilled chicken marinated in yogurt and spices', price: 220, isVegetarian: false },
    { categoryIndex: 0, name: 'Paneer Tikka', description: 'Grilled cottage cheese with bell peppers', price: 180, isVegetarian: true },
    
    // Main Course
    { categoryIndex: 1, name: 'Butter Chicken', description: 'Creamy tomato-based chicken curry', price: 320, isVegetarian: false },
    { categoryIndex: 1, name: 'Dal Makhani', description: 'Rich and creamy black lentil curry', price: 240, isVegetarian: true },
    { categoryIndex: 1, name: 'Palak Paneer', description: 'Cottage cheese in spinach gravy', price: 260, isVegetarian: true },
    
    // Rice & Biryani
    { categoryIndex: 2, name: 'Chicken Biryani', description: 'Fragrant basmati rice with spiced chicken', price: 380, isVegetarian: false },
    { categoryIndex: 2, name: 'Vegetable Biryani', description: 'Aromatic rice with mixed vegetables', price: 320, isVegetarian: true },
    { categoryIndex: 2, name: 'Jeera Rice', description: 'Basmati rice tempered with cumin', price: 160, isVegetarian: true },
    
    // Breads
    { categoryIndex: 3, name: 'Naan', description: 'Soft leavened bread baked in tandoor', price: 60, isVegetarian: true },
    { categoryIndex: 3, name: 'Garlic Naan', description: 'Naan topped with fresh garlic', price: 80, isVegetarian: true },
    { categoryIndex: 3, name: 'Roti', description: 'Whole wheat flatbread', price: 40, isVegetarian: true },
    
    // Desserts
    { categoryIndex: 4, name: 'Gulab Jamun', description: 'Sweet milk dumplings in sugar syrup', price: 120, isVegetarian: true },
    { categoryIndex: 4, name: 'Kulfi', description: 'Traditional Indian ice cream', price: 100, isVegetarian: true },
    
    // Beverages
    { categoryIndex: 5, name: 'Masala Chai', description: 'Spiced Indian tea', price: 40, isVegetarian: true },
    { categoryIndex: 5, name: 'Lassi', description: 'Yogurt-based drink', price: 80, isVegetarian: true },
    { categoryIndex: 5, name: 'Fresh Lime Water', description: 'Refreshing lime drink', price: 60, isVegetarian: true }
  ];

  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems[i];
    await prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        categoryId: createdCategories[item.categoryIndex].id,
        name: item.name,
        description: item.description,
        price: item.price,
        isVegetarian: item.isVegetarian,
        spiceLevel: Math.random() > 0.5 ? 'medium' : 'mild',
        allergens: item.isVegetarian ? ['dairy'] : ['dairy', 'gluten'],
        sortOrder: i
      }
    });
  }

  // Create sample users
  const users = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        phoneNumber: `+9198765432${i.toString().padStart(2, '0')}`,
        isVerified: true,
        preferredLanguage: 'en'
      }
    });

    await prisma.userProfile.create({
      data: {
        userId: user.id,
        firstName: `User${i}`,
        lastName: 'Test',
        email: `user${i}@example.com`,
        spiceLevel: ['mild', 'medium', 'spicy'][Math.floor(Math.random() * 3)],
        dietaryRestrictions: Math.random() > 0.5 ? ['vegetarian'] : []
      }
    });

    users.push(user);
  }

  // Create restaurant staff
  await prisma.restaurantStaff.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Admin User',
      email: 'admin@spicegarden.com',
      phoneNumber: '+911234567890',
      role: 'admin',
      permissions: {
        canManageMenu: true,
        canManageOrders: true,
        canManageStaff: true,
        canViewReports: true
      }
    }
  });

  console.log('✅ Database seeding completed successfully!');
  console.log(`📊 Created:`);
  console.log(`   - 1 restaurant: ${restaurant.name}`);
  console.log(`   - ${businessHours.length} business hours`);
  console.log(`   - ${tables.length} tables`);
  console.log(`   - ${createdCategories.length} menu categories`);
  console.log(`   - ${menuItems.length} menu items`);
  console.log(`   - ${users.length} users with profiles`);
  console.log(`   - 1 restaurant staff member`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
