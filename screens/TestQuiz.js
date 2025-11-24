import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { testService } from "../services/api";
import { styles } from "../styles/TestStyles";

export default function TestQuiz({ route, navigation }) {
  const { topic } = route.params;
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTest();
  }, []);

  const loadTest = async () => {
    try {
      setLoading(true);
      const data = await testService.getTest(topic);
      setTest(data);
      setQuestions(data.questions);
    } catch (error) {
      Alert.alert("Error", "Failed to load questions");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIndex]: answerIndex,
    });
  };

  const goToQuestion = (index) => {
    setCurrentIndex(index);
  };

  const handleFinish = () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    const correctCount = questions.reduce((count, question, index) => {
      const userAnswer = selectedAnswers[index];
      return count + (userAnswer === question.correctAnswer ? 1 : 0);
    }, 0);

    navigation.replace("TestResults", { 
      questions, 
      selectedAnswers,
      totalQuestions: questions.length,
      answeredCount,
      correctCount,
      topic: test.topic,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1d4ed8" />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <View style={styles.container}>
      <View style={styles.quizHeader}>
        <Text style={styles.quizTitle}>{test.topic}</Text>
        <Text style={styles.progressText}>
          Question {currentIndex + 1} of {questions.length}
        </Text>
        <Text style={styles.answeredText}>
          Answered: {answeredCount} of {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.quizContent}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        {currentQuestion.answers.map((answer, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.answerButton,
              selectedAnswers[currentIndex] === index && styles.answerButtonSelected,
            ]}
            onPress={() => selectAnswer(index)}
          >
            <Text
              style={[
                styles.answerText,
                selectedAnswers[currentIndex] === index && styles.answerTextSelected,
              ]}
            >
              {answer}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.navigationContainer}>
        <View style={styles.questionDots}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {questions.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.questionDot,
                  selectedAnswers[index] !== undefined && styles.questionDotAnswered,
                  index === currentIndex && styles.questionDotCurrent,
                ]}
                onPress={() => goToQuestion(index)}
              >
                <Text
                  style={[
                    styles.questionDotText,
                    (selectedAnswers[index] !== undefined || index === currentIndex) &&
                      styles.questionDotTextActive,
                  ]}
                >
                  {index + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.navigationButtons}>
          {currentIndex > 0 && (
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => setCurrentIndex(currentIndex - 1)}
            >
              <Text style={styles.navButtonText}>← Previous</Text>
            </TouchableOpacity>
          )}

          {currentIndex < questions.length - 1 ? (
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => setCurrentIndex(currentIndex + 1)}
            >
              <Text style={styles.navButtonText}>Next →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
              <Text style={styles.finishButtonText}>Finish</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
