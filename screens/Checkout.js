import React, { useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { checkoutStyles } from "../styles/CheckoutStyles";
import NavBar from "../components/NavBar";
import { useCart } from "../context/CartContext";
import { productService } from "../services/api";

const Checkout = ({ navigation, tokenRole }) => {
  const { items, updateQty, totalPrice, clearCart } = useCart();

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + item.priceMinor * item.qty;
    }, 0);
  }, [items]);

  const totalPLN = (total / 100).toFixed(0);

  const placeOrder = async () => {
    if (!items.length) {
      Alert.alert(
        "Cart is empty",
        "Please add items before placing the order."
      );
      return;
    }
    try {
      console.log("Checkout: Cart items before purchase:", items);
      const result = await productService.createOrder(items);
      Alert.alert(
        "Success",
        `Order created! Added ${result.addedLessons} lessons and ${result.addedExams} exams to your account.`
      );
      clearCart();
      navigation.navigate("Home");
    } catch (error) {
      console.log("Checkout error:", error);
      Alert.alert("Error", "Purchase failed: " + error.message);
    }
  };

  const renderItem = ({ item }) => {
    const itemTotal = (item.priceMinor * item.qty) / 100;

    return (
      <View style={checkoutStyles.itemRow}>
        <View style={checkoutStyles.itemLeft}>
          <Text style={checkoutStyles.itemTitle}>{item.title}</Text>
          <View style={checkoutStyles.qtyControls}>
            <TouchableOpacity
              style={checkoutStyles.qtyBtn}
              onPress={() => updateQty(item.id, -1)}
              activeOpacity={0.8}
            >
              <Text style={checkoutStyles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={checkoutStyles.qtyValue}>{item.qty}</Text>
            <TouchableOpacity
              style={checkoutStyles.qtyBtn}
              onPress={() => updateQty(item.id, +1)}
              activeOpacity={0.8}
            >
              <Text style={checkoutStyles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={checkoutStyles.itemPrice}>{itemTotal.toFixed(0)} PLN</Text>
      </View>
    );
  };

  return (
    <View style={checkoutStyles.container}>
      <View style={checkoutStyles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={checkoutStyles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#2d4150" />
        </TouchableOpacity>
        <Text style={checkoutStyles.headerText}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Payment method row (placeholder) */}
      {/* <TouchableOpacity style={checkoutStyles.paymentRow} activeOpacity={0.8}>
        <Text style={checkoutStyles.paymentLabel}>PAYMENT</Text>
        <View style={checkoutStyles.paymentRight}>
          <Text style={checkoutStyles.paymentMethod}>Visa •••• 1234</Text>
          <Ionicons name="chevron-forward" size={18} color="#6b7280" />
        </View>
      </TouchableOpacity> */}

      <View style={checkoutStyles.sectionDivider} />

      <View style={checkoutStyles.columnsHeader}>
        <Text style={[checkoutStyles.colText, { flex: 1 }]}>ITEMS</Text>
        <Text
          style={[checkoutStyles.colText, { width: 80, textAlign: "right" }]}
        >
          PRICE
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => (
          <View style={checkoutStyles.itemSeparator} />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />

      <View style={checkoutStyles.totalRow}>
        <Text style={checkoutStyles.totalLabel}>Total</Text>
        <Text style={checkoutStyles.totalValue}>{totalPLN} PLN</Text>
      </View>

      <TouchableOpacity
        style={checkoutStyles.ctaButton}
        onPress={placeOrder}
        activeOpacity={0.5}
      >
        <Text style={checkoutStyles.ctaText}>Place order</Text>
      </TouchableOpacity>

      <NavBar role={tokenRole} navigation={navigation} />
    </View>
  );
};

export default Checkout;
