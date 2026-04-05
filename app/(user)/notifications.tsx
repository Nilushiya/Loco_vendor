import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const notifications = [
    { id: '1', type: 'new_order', text: 'New Order Alert 🔔', time: 'Just now' },
    { id: '2', type: 'cancelled', text: 'Order Cancelled', time: '10 mins ago' },
    { id: '3', type: 'payment', text: 'Payment Received', time: '1 hour ago' },
  ];

  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'new_order': return { name: 'notifications', color: '#ff9800' };
      case 'cancelled': return { name: 'close-circle', color: '#f44336' };
      case 'payment': return { name: 'cash', color: '#4caf50' };
      default: return { name: 'information-circle', color: '#2196f3' };
    }
  };

  return (
    <LinearGradient colors={["#FEEDE6", "#FFFFFF"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.listContainer}>
          {notifications.map((notif) => {
            const { name, color } = getIconAndColor(notif.type);
            return (
              <View key={notif.id} style={styles.notificationCard}>
                <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                  <Ionicons name={name as any} size={24} color={color} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.notifText}>{notif.text}</Text>
                  <Text style={styles.timeText}>{notif.time}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 20, paddingTop: 50 },
  listContainer: { gap: 15 },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    marginLeft: 15,
    flex: 1,
  },
  notifText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#888',
  }
});
