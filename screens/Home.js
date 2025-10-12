import React, { useState} from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import NavBar from "../components/NavBar";
import { homeStyles } from "../styles/HomeStyles";
import { productService } from "../services/api";

const Home = ({ navigation, userId, tokenRole }) => {
  const [purchasedLessonsQty, setPurchasedLessonsQty] = useState();
  const [purchasedExamsQty, setPurchasedExamsQty] = useState();

  const loadInitialData = async () => {
    try {
      const balance = await productService.getUserBalance();
      setPurchasedLessonsQty(balance.purchasedLessons);
      setPurchasedExamsQty(balance.purchasedExams);
      console.log("User balance:", balance);
    } catch (error) {
      console.log("Error fetching user balance:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadInitialData();
    }, [userId])
  );

  return (
  <View style={homeStyles.container}>
    <View style={homeStyles.content}>
      <Text style={homeStyles.title}>DriveON</Text>
      <TouchableOpacity 
        style={homeStyles.scheduleButton}
        onPress={() => navigation.navigate("Schedule")}
      >
        <LinearGradient
          colors={['#1d4ed8', '#728edbff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={homeStyles.scheduleGradient}
        >
          <Image source={require("../assets/car.png")} style={homeStyles.scheduleCarImage} />
          <Text style={homeStyles.scheduleButtonText}>Schedule</Text>
        </LinearGradient>
      </TouchableOpacity>
      <Text style={homeStyles.sectionTitle}>You have purchased:</Text>
      <Text style={homeStyles.text}>Driving lessons - {purchasedLessonsQty}</Text>
      <Text style={homeStyles.text}>Practical exams - {purchasedExamsQty}</Text>
      
      
      
      <View style={homeStyles.buttonsContainer}>
        <TouchableOpacity 
          style={homeStyles.button}
          onPress={() => navigation.navigate("Store")}
        >
          <Text style={homeStyles.buttonText}>Store</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={homeStyles.button}
          onPress={() => navigation.navigate("Booking")}
        >
          <Text style={homeStyles.buttonText}>Booking</Text>
        </TouchableOpacity>
      </View>
    </View>
    <NavBar role={tokenRole} navigation={navigation} />
  </View>
);

};


export default Home;
