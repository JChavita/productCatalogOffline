import * as SQLite from 'expo-sqlite';

// Create database connection
export const getDbConnection = async () => {
  try {
    const db = await SQLite.openDatabaseAsync('products.db');
    console.log("✅ Database opened successfully");
    return db;
  } catch (error) {
    console.error("❌ Error opening database:", error);
    throw error;
  }
};

// Create table
export const createTable = async () => {
  try {
    const db = await getDbConnection();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        title TEXT,
        price REAL,
        category TEXT,
        description TEXT,
        image TEXT,
        rating_rate REAL,
        rating_count INTEGER
      );
    `);
    console.log("Table created successfully");
  } catch (error) {
    console.error("Error creating table:", error);
    throw error;
  }
};

// Insert a new product
export const insertProduct = async (product) => {
  try {
    const db = await getDbConnection();
    // Check if product already exists
    const existingProduct = await db.getFirstAsync(
      'SELECT id FROM products WHERE id = ?;',
      [product.id]
    );
    
    if (!existingProduct) {
      await db.runAsync(
        'INSERT INTO products (id, title, price, category, description, image, rating_rate, rating_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
        [
          product.id, 
          product.title, 
          product.price, 
          product.category, 
          product.description, 
          product.image,
          product.rating?.rate || 0,
          product.rating?.count || 0
        ]
      );
      console.log("✅ Product inserted successfully with ID:", product.id);
      // In your insertProduct function, add logging:
      
    } else {
      console.log("ℹ️ Product already exists with ID:", product.id);
    }
  } catch (error) {
    console.error("❌ Error inserting product:", error);
    throw error;
  }
};

// Get all products
export const getProducts = async () => {
  try {
    const db = await getDbConnection();
    const products = await db.getAllAsync('SELECT * FROM products');
    
    // Transform the products to match the API structure
    const transformedProducts = products.map(product => ({
      ...product,
      rating: {
        rate: product.rating_rate,
        count: product.rating_count
      }
    }));
    
    console.log(`Retrieved ${products.length} products`);
    return transformedProducts;
  } catch (error) {
    console.error("Error getting products:", error);
    return [];
  }
};

// Get a product by ID
export const getProductById = async (id) => {
  try {
    const db = await getDbConnection();
    const product = await db.getFirstAsync('SELECT * FROM products WHERE id = ?;', [id]);
    
    if (product) {
      // Transform the product to match the API structure
      return {
        ...product,
        rating: {
          rate: product.rating_rate,
          count: product.rating_count
        }
      };
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Error getting product with ID ${id}:`, error);
    return null;
  }
};

