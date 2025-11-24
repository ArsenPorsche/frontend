import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { styles } from "../styles/TestStyles";

export default function TestResults({ route, navigation }) {
  const { questions, selectedAnswers, totalQuestions, answeredCount, correctCount, topic } = route.params;

  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const goToCategories = () => {
    navigation.navigate("TestCategories");
  };

  const retryTest = () => {
    navigation.replace("TestQuiz", { topic });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.resultsScroll} contentContainerStyle={styles.resultsScrollContent}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultEmoji}>📊</Text>
          <Text style={styles.resultTitle}>Results</Text>
          <Text style={styles.resultScore}>
            {correctCount} / {totalQuestions}
          </Text>
          <Text style={styles.resultPercentage}>{percentage}%</Text>
        </View>

        <View style={styles.resultsSummary}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total questions:</Text>
            <Text style={styles.summaryValue}>{totalQuestions}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Answered:</Text>
            <Text style={styles.summaryValue}>{answeredCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Correct:</Text>
            <Text style={[styles.summaryValue, styles.correctValue]}>{correctCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Incorrect:</Text>
            <Text style={[styles.summaryValue, styles.wrongValue]}>
              {answeredCount - correctCount}
            </Text>
          </View>
        </View>

        <Text style={styles.questionsReviewTitle}>Review Answers</Text>

        {questions.map((question, index) => {
          const userAnswer = selectedAnswers[index];
          const isCorrect = userAnswer === question.correctAnswer;
          const wasAnswered = userAnswer !== undefined;

          return (
            <View
              key={index}
              style={[
                styles.reviewCard,
                isCorrect && styles.reviewCardCorrect,
                !isCorrect && wasAnswered && styles.reviewCardWrong,
                !wasAnswered && styles.reviewCardUnanswered,
              ]}
            >
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewNumber}>Question {index + 1}</Text>
                <Text style={[
                  styles.reviewStatus,
                  isCorrect && styles.reviewStatusCorrect,
                  !isCorrect && wasAnswered && styles.reviewStatusWrong,
                  !wasAnswered && styles.reviewStatusUnanswered,
                ]}>
                  {!wasAnswered ? "⊘ Skipped" : isCorrect ? "✓ Correct" : "✗ Incorrect"}
                </Text>
              </View>
              
              <Text style={styles.reviewQuestion}>{question.question}</Text>
              
              {question.answers.map((answer, ansIndex) => {
                const isUserAnswer = userAnswer === ansIndex;
                const isCorrectAnswer = ansIndex === question.correctAnswer;
                
                return (
                  <View
                    key={ansIndex}
                    style={[
                      styles.reviewAnswer,
                      isCorrectAnswer && styles.reviewAnswerCorrect,
                      isUserAnswer && !isCorrectAnswer && styles.reviewAnswerWrong,
                    ]}
                  >
                    <Text
                      style={[
                        styles.reviewAnswerText,
                        (isUserAnswer || isCorrectAnswer) && styles.reviewAnswerTextBold,
                      ]}
                    >
                      {answer}
                    </Text>
                    {isCorrectAnswer && (
                      <Text style={styles.reviewAnswerMark}>✓</Text>
                    )}
                    {isUserAnswer && !isCorrectAnswer && (
                      <Text style={styles.reviewAnswerMarkWrong}>✗</Text>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.resultsActions}>
        <TouchableOpacity style={styles.retryButton} onPress={retryTest}>
          <Text style={styles.retryButtonText}>Practice Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={goToCategories}>
          <Text style={styles.backButtonText}>Back to Topics</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
