import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NavBar from "../components/NavBar";
import { storeStyles } from "../styles/StoreStyles";
import { styles as appStyles } from "../styles/AppStyles";
import { useCart } from "../context/CartContext";
import { productService } from "../services/api";

const StoreItem = ({ item, onAdd }) => {
  const displayPrice = `${(item.priceMinor / 100).toFixed(0)} PLN`;

  return (
    <View style={[storeStyles.item, item.highlighted && storeStyles.itemHighlighted]}>
      <View style={storeStyles.itemLeft}>
        <Text style={storeStyles.itemTitle}>{item.title}</Text>
        <Text style={storeStyles.itemDesc}>{item.description}</Text>
      </View>
      <View style={storeStyles.itemRight}>
        <Text style={storeStyles.itemPrice}>{displayPrice}</Text>
        <TouchableOpacity onPress={() => onAdd(item)} style={storeStyles.cartButton} activeOpacity={0.5}>
          <Ionicons name="cart" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Store = ({ navigation, tokenRole }) => {
  const { addItem, totalQty } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (item) => {
    console.log("Add to cart:", item.code);
    const cartItem = {
      id: item.code,
      title: item.title,
      priceMinor: item.priceMinor,
      entitlements: item.entitlements,
    };
    addItem(cartItem, 1);
  };

  const handleOpenCart = () => {
    navigation.navigate("Checkout");
  };

  return (
    <View style={storeStyles.container}>
      <ScrollView contentContainerStyle={storeStyles.scrollContent}>
        <Text style={appStyles.header}>Shop</Text>
        <View style={storeStyles.introBox}>
          <Text style={storeStyles.introBold}>Welcome to our driving school shop!</Text>
          <Text style={storeStyles.introText}>Here you can easily purchase selected products:</Text>
        </View>

        {loading ? (
          <View style={storeStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={storeStyles.loadingText}>Loading products...</Text>
          </View>
        ) : error ? (
          <View style={storeStyles.errorContainer}>
            <Text style={storeStyles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadProducts} style={storeStyles.retryButton}>
              <Text style={storeStyles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => <StoreItem item={item} onAdd={handleAdd} />}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={storeStyles.separator} />}
            contentContainerStyle={storeStyles.listContent}
          />
        )}
      </ScrollView>

      <TouchableOpacity style={storeStyles.floatingCart} onPress={handleOpenCart} activeOpacity={0.85}>
        <Ionicons name="cart" size={24} color="#fff" />
        {totalQty > 0 && (
          <View style={storeStyles.cartBadge}>
            <Text style={storeStyles.cartBadgeText}>{totalQty}</Text>
          </View>
        )}
      </TouchableOpacity>

      <NavBar role={tokenRole} navigation={navigation} />
    </View>
  );
};

export default Store;
