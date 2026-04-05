import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Colors } from "../../constants/theme";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const OTPVerificationScreen = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    if (!otp) {
      setError("OTP is required.");
      return false;
    }
    if (otp.length < 4) {
      setError("Please enter a valid OTP.");
      return false;
    }
    setError("");
    return true;
  };

  const handleVerify = () => {
    if (!validate()) return;

    // TODO: Connect this to actual backend verfication service mapping
    Alert.alert("Success", "Your email has been verified!");
    
    // Redirecting user to login or direct access after success.
    router.replace("/login");
  };

  return (
    <LinearGradient colors={["#FEEDE6", "#FFFFFF"]} style={styles.gradient}>
      <View style={styles.card}>
        <Text style={styles.title}>OTP Verification</Text>
        <Text style={styles.subtitle}>
          Please enter the OTP sent to:{"\n"}
          <Text style={{ fontWeight: "bold" }}>{email || "your email"}</Text>
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter OTP (e.g. 1234)"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
          maxLength={6}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleVerify}>
          <Text style={styles.buttonText}>Verify OTP</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => Alert.alert("Resent", "A new OTP has been sent!")}>
          <Text style={styles.resendText}>Did not receive code? Resend</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default OTPVerificationScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    padding: 25,
    borderRadius: 20,
    marginHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.default.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
    color: "#333",
  },
  input: {
    backgroundColor: Colors.default.white,
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 50,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Colors.default.gray,
    textAlign: "center",
    fontSize: 18,
    letterSpacing: 2,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 10,
    textAlign: "center",
  },
  button: {
    backgroundColor: Colors.default.primary,
    height: 45,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resendText: {
    textAlign: "center",
    color: Colors.default.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  }
});
