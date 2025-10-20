import { StyleSheet } from "react-native";

export const checkoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: 60,
    position: "relative",
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#e1e8ed",
    marginTop: -10,
  },
  backBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    
  },
  paymentRow: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  paymentLabel: {
    color: "#6b7280",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  paymentRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  paymentMethod: {
    color: "#111827",
    fontWeight: "600",
  },
  sectionDivider: {
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
  },
  columnsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  colText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
  },
  itemRow: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLeft: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1d4ed8",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: -1,
  },
  qtyValue: {
    minWidth: 24,
    textAlign: "center",
    fontWeight: "700",
    color: "#1f2937",
  },
  itemPrice: {
    width: 80,
    textAlign: "right",
    fontWeight: "600",
    color: "#1f2937",
  },
  itemSeparator: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  totalRow: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
  },
  totalLabel: {
    color: "#6b7280",
    fontWeight: "700",
  },
  totalValue: {
    color: "#111827",
    fontWeight: "700",
  },
  ctaButton: {
    marginHorizontal: 16,
    marginBottom: 90, // above the NavBar
    backgroundColor: "#1d4ed8",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 52,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
