import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", 
    position: "relative",
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 80, 
    justifyContent: "center", 
    alignItems: "center", 
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "bold",
    color: "#000", 
  },
  image: {
    width: "80%", 
    height: 120,
    resizeMode: "contain",
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    fontSize: 16,
    color: "#333", 
  },
  text: {
    fontSize: 15,
    marginBottom: 5,
    color: "#666", 
    textAlign: "center", 
  },
});