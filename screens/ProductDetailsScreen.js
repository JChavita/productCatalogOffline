import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { getProductById } from "../database";
import NetInfo from "@react-native-community/netinfo";

const ProductDetailsScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const loadProductDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check network connection
        const netInfo = await NetInfo.fetch();
        setIsConnected(netInfo.isConnected);
        
        // Try to fetch fresh data from API if connected
        if (netInfo.isConnected) {
          try {
            const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
            
            if (response.ok) {
              const apiProduct = await response.json();
              setProduct(apiProduct);
              setLoading(false);
              return;
            }
          } catch (apiError) {
            console.log("API fetch failed, falling back to local database:", apiError);
          }
        }
        
        // If offline or API failed, load from database
        const localProduct = await getProductById(productId);
        
        if (localProduct) {
          setProduct(localProduct);
        } else {
          setError("Product not found in database.");
        }
      } catch (err) {
        console.error("Error loading product details:", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    loadProductDetails();
  }, [productId]);


  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading Product Details...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>{error || "Product not found"}</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline Mode - Showing cached data</Text>
        </View>
      )}
      
      <View style={styles.contentContainer}>
        <Image 
          source={{ uri: product.image }} 
          style={styles.image} 
          defaultSource={require('../assets/image.png')}
        />
        
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>${parseFloat(product.price).toFixed(2)}</Text>
          
           {/* Rating Section */}
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>⭐ {product.rating.rate} / 5</Text>
              <Text style={styles.ratingCount}>({product.rating.count} reviews)</Text>
            </View>
          
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>Category:</Text>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Products</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  offlineBanner: {
    backgroundColor: "#ff9800",
    padding: 10,
    alignItems: "center",
  },
  offlineText: {
    color: "#fff",
    fontWeight: "bold",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  contentContainer: {
    alignItems: "center",
    padding: 16,
  },
  image: {
    width: "100%",
    height: 300,
    resizeMode: "contain",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
  },
  infoContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  price: {
    fontSize: 24,
    color: "#388e3c",
    fontWeight: "bold",
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: "#757575",
    marginRight: 4,
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
    textTransform: "capitalize",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    width: "100%",
    marginVertical: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: "#333",
  },
  backButton: {
    backgroundColor: "#2196f3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignSelf: "center",
    marginTop: 16,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
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

export default ProductDetailsScreen;