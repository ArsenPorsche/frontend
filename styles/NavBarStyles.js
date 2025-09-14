import { StyleSheet } from "react-native";

export const navBarStyles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 5,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    zIndex: 10,
  },
});