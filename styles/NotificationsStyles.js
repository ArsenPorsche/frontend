import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#e1e8ed",
    position: "relative",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#1f2937",
  },
  markAllButton: {
    fontSize: 14,
    color: "#1d4ed8",
    fontWeight: "600",
    position: "absolute",
    right: 20,
  },
  unreadBanner: {
    backgroundColor: "#dbeafe",
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#bfdbfe",
  },
  unreadText: {
    color: "#1d4ed8",
    fontSize: 14,
    fontWeight: "600",
  },
  notificationCard: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#e1e8ed",
  },
  unreadCard: {
    backgroundColor: "#f0f9ff",
    borderLeftWidth: 4,
    borderLeftColor: "#1d4ed8",
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d4150",
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1d4ed8",
    marginLeft: 8,
  },
  notificationBody: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
  },
  emptyList: {
    flexGrow: 1,
  },
  unreadBadge: {
    backgroundColor: "#1d4ed8",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  backButtonContainer: {
    position: "absolute",
    left: 20,
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: "#1d4ed8",
    fontWeight: "600",
  },
});
