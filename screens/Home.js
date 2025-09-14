import React from "react";
import { View, Text, Image } from "react-native";
import NavBar from "../components/NavBar";
import { homeStyles } from "../styles/HomeStyles";

const Home = ({ navigation, tokenRole }) => (
  <View style={homeStyles.container}>
    <View style={homeStyles.content}>
      <Text style={homeStyles.title}>DriveON</Text>
      <Image
        source={require("../assets/car.png")}
        style={homeStyles.image}
      />
      <Text style={homeStyles.sectionTitle}>You have purchased:</Text>
      <Text style={homeStyles.text}>Driving lessons - 0</Text>
      <Text style={homeStyles.text}>Practical exams - 0</Text>
      {/* Buttons can be added later */}
    </View>
    <NavBar role={tokenRole} navigation={navigation} />
  </View>
);

export default Home;