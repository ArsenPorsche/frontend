import { StyleSheet } from "react-native";

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    position: "relative",
    paddingTop: 60,
  },
  header: {
    paddingBottom: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#e1e8ed",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 0,
    textAlign: "center",
    color: "#2d4150",
  },
  menuItem: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#e1e8ed",
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  menuText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d4150",
  },
});