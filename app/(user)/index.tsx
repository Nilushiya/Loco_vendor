import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/theme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function Dashboard() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <LinearGradient colors={["#FEEDE6", "#FFFFFF"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header section with Open/Close Toggle */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>Welcome back, Loco Vendor!</Text>
          <View style={styles.toggleContainer}>
            <Text style={[styles.statusText, { color: isOpen ? Colors.default.primary : 'gray' }]}>
              {isOpen ? "🟢 OPEN" : "🔴 CLOSED"}
            </Text>
            <Switch
              value={isOpen}
              onValueChange={setIsOpen}
              trackColor={{ false: '#767577', true: Colors.default.primary }}
              thumbColor={isOpen ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Sales & Orders Overview Cards */}
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Rs. 12,500</Text>
              <Text style={styles.statLabel}>Today Sales</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>25</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statItemBorder} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#ff8c00' }]}>5</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Recent Notifications / New Orders */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Orders 🔔</Text>
          <TouchableOpacity onPress={() => router.push('/(user)/orders')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.ordersList}>
          {['1234', '1235'].map((id, index) => (
            <TouchableOpacity key={id} style={styles.orderListItem} onPress={() => router.push(`/(user)/order/${id}` as any)}>
              <MaterialIcons name="fastfood" size={24} color={Colors.default.primary} />
              <View style={styles.orderListText}>
                <Text style={styles.orderNumberTitle}>Order #{id}</Text>
                <Text style={styles.orderTime}>Just now</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="gray" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Links / Action Grid */}
        <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionBox} onPress={() => router.push('/(user)/menu')}>
            <Ionicons name="restaurant-outline" size={30} color={Colors.default.primary} />
            <Text style={styles.actionText}>Manage Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBox} onPress={() => router.push('/(user)/orders')}>
            <Ionicons name="receipt-outline" size={30} color={Colors.default.primary} />
            <Text style={styles.actionText}>Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBox} onPress={() => router.push('/(user)/analytics')}>
            <Ionicons name="bar-chart-outline" size={30} color={Colors.default.primary} />
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBox} onPress={() => router.push('/(user)/profile')}>
            <Ionicons name="person-outline" size={30} color={Colors.default.primary} />
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
        </View>
        
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  toggleContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statsCard: {
    backgroundColor: Colors.default.white,
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    marginBottom: 25,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statItemBorder: {
    width: 1,
    height: '80%',
    backgroundColor: '#eee',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.default.primary,
    fontWeight: '600',
    marginBottom: 10,
  },
  ordersList: {
    backgroundColor: Colors.default.white,
    borderRadius: 15,
    padding: 10,
    marginBottom: 25,
  },
  orderListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderListText: {
    flex: 1,
    marginLeft: 15,
  },
  orderNumberTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  orderTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionBox: {
    width: '48%',
    backgroundColor: Colors.default.white,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  actionText: {
    marginTop: 10,
    fontWeight: '600',
    color: '#333',
  },
});
