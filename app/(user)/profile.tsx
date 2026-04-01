import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    // Implement logout logic here later
    router.replace('/(auth)/login');
  };

  return (
    <LinearGradient colors={["#FEEDE6", "#FFFFFF"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="restaurant" size={40} color={Colors.default.primary} />
          </View>
          <Text style={styles.restaurantName}>Loco Vendor Resto</Text>
          <Text style={styles.detailText}>123 Food Street, Dehiwala</Text>
          <Text style={styles.detailText}>+94 77 123 4567</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.menuBtn}>
            <Ionicons name="create-outline" size={20} color="#333" />
            <Text style={styles.menuBtnText}>Edit Details</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.btnIconRight}/>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuBtn}>
            <Ionicons name="card-outline" size={20} color="#333" />
            <Text style={styles.menuBtnText}>Bank Info</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.btnIconRight}/>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuBtn, styles.logoutBtn]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#F44336" />
            <Text style={[styles.menuBtnText, { color: '#F44336' }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 20, paddingTop: 50 },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEEDE6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  restaurantName: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  detailText: { fontSize: 16, color: '#666', marginBottom: 5 },

  buttonsContainer: {
    gap: 15,
  },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
  },
  menuBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 15,
    flex: 1,
  },
  btnIconRight: {
    marginLeft: 'auto',
  },
  logoutBtn: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ffebee',
    backgroundColor: '#fff',
  }
});
