import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Colors } from '../../../constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function OrderProcessingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<'Accepted' | 'Ready'>('Accepted');

  const handleMarkReady = () => {
    setStatus('Ready');
    Alert.alert('Status Updated', 'Order is marked as Ready!');
  };

  return (
    <LinearGradient colors={["#FEEDE6", "#FFFFFF"]} style={styles.gradient}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.orderNumberTitle}>Order #{id}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{status}</Text>
            </View>
          </View>

          <Text style={styles.detailLabel}>Customer Name</Text>
          <Text style={styles.detailText}>John Doe</Text>

          <View style={styles.divider} />

          <Text style={styles.detailLabel}>Order Items</Text>
          <View style={styles.itemsList}>
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>• Chicken Rice</Text>
              <Text style={styles.itemQty}>x2</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>• Coke</Text>
              <Text style={styles.itemQty}>x1</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionBtn, status === 'Ready' && styles.actionBtnDisabled]}
              onPress={handleMarkReady}
              disabled={status === 'Ready'}
            >
              <Text style={styles.actionBtnText}>Mark as Ready</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 5,
  },
  container: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  orderNumberTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.default.primary,
  },
  badge: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#e65100',
    fontWeight: 'bold',
    fontSize: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  itemsList: {
    backgroundColor: '#fafafa',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    color: '#444',
  },
  itemQty: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  actionsContainer: {
    marginTop: 10,
  },
  actionBtn: {
    backgroundColor: Colors.default.primary,
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionBtnDisabled: {
    opacity: 0.4,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
