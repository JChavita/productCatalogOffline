import React, { useState, useEffect } from "react";
import { 
  View, Text, FlatList, Image, ActivityIndicator, StyleSheet, TouchableOpacity 
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { createTable, insertProduct, getProducts } from "../database";


const ProductListScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure the table exists
      await createTable();
      
      // Check network connection
      const netInfo = await NetInfo.fetch();
      setIsConnected(netInfo.isConnected);
      
      if (netInfo.isConnected) {
        // If online, fetch from API
        const response = await fetch("https://fakestoreapi.com/products");
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const apiProducts = await response.json();
        
        // Save products to local database
        for (const product of apiProducts) {
          await insertProduct(product);
        }
        
        // Update state with the API data
        setProducts(apiProducts);
      } else {
        // If offline, load from database
        const localProducts = await getProducts();
        
        if (localProducts.length > 0) {
          setProducts(localProducts);
        } else {
          setError("No products available offline.");
        }
      }
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load products. Please try again later.");
      
      // Try loading from database as fallback
      try {
        const localProducts = await getProducts();
        if (localProducts.length > 0) {
          setProducts(localProducts);
          setError("Using cached data due to connection error.");
        }
      } catch (dbErr) {
        console.error("Database fallback failed:", dbErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set up a subscription to monitor network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    loadProducts();
    
    // Clean up the network listener when component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  const handleRefresh = async () => {
    await loadProducts();
  };


  if (error && products.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline Mode - Showing cached data</Text>
        </View>
      )}
      
      {error && (
        <Text style={styles.errorBanner}>{error}</Text>
      )}

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productItem}
            onPress={() => navigation.navigate("ProductDetailsScreen", { productId: item.id })}
          >
            <Image 
              source={{ uri: item.image }} 
              style={styles.image} 
            />
            <View style={styles.productInfo}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.price}>${parseFloat(item.price).toFixed(2)}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>⭐ {item.rating?.rate} / 5</Text>
                <Text style={styles.ratingCount}>({item.rating?.count} reviews)</Text>
              </View>

              <Text style={styles.category}>{item.category}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        onRefresh={handleRefresh}
        refreshing={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  offlineBanner: {
    backgroundColor: "#ff9800",
    padding: 10,
    alignItems: "center",
  },
  offlineText: {
    color: "#fff",
    fontWeight: "bold",
  },
  errorBanner: {
    backgroundColor: "#ffebee",
    color: "#d32f2f",
    padding: 10,
    textAlign: "center",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#2196f3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 25,
    overflow: "hidden",
    resizeMode: "cover",
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  price: {
    fontSize: 14,
    color: "#388e3c",
    fontWeight: "bold",
  },
  category: {
    fontSize: 12,
    color: "#757575",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff9800", // Yellow color for rating stars
    marginRight: 6,
  },
  ratingCount: {
    fontSize: 14,
    color: "#757575",
  },  
});

export default ProductListScreen;