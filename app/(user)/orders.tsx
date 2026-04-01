import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';

const TABS = ['New', 'Ready', 'Completed'];

// Mock Data
const MOCK_ORDERS = [
  { id: '1234', items: 'Chicken Rice x2', total: 'Rs. 1200', status: 'New', customer: 'John' },
  { id: '1235', items: 'Fried Rice x1, Coke x1', total: 'Rs. 850', status: 'New', customer: 'Alice' },
  { id: '1236', items: 'Noodles x2', total: 'Rs. 1000', status: 'Ready', customer: 'Bob' },
  { id: '1237', items: 'Chicken Kottu x1', total: 'Rs. 1500', status: 'Completed', customer: 'Emma' },
];

export default function OrdersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('New');

  const filteredOrders = MOCK_ORDERS.filter(order => order.status === activeTab);

  const handleAccept = (id: string) => {
    Alert.alert('Accepted', `Order #${id} accepted successfully.`);
    router.push(`/(user)/order/${id}` as any);
  };

  const handleReject = (id: string) => {
    Alert.alert('Rejected', `Order #${id} has been rejected.`);
  };

  const navigateToOrder = (id: string) => {
    router.push(`/(user)/order/${id}` as any);
  }

  const renderOrderCard = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={0.8}
        onPress={() => item.status !== 'New' ? navigateToOrder(item.id) : null}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.orderNumber}>Order #{item.id}</Text>
          <Text style={styles.orderTime}>2 mins ago</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.orderItems}>Items: {item.items}</Text>
          <Text style={styles.orderTotal}>Total: {item.total}</Text>
        </View>

        {item.status === 'New' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.btn, styles.acceptBtn]}
              onPress={() => handleAccept(item.id)}
            >
              <Ionicons name="checkmark" size={18} color="#fff" style={styles.btnIcon} />
              <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.rejectBtn]}
              onPress={() => handleReject(item.id)}
            >
              <Ionicons name="close" size={18} color={Colors.default.primary} style={styles.btnIcon} />
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status !== 'New' && (
          <View style={styles.actionButtons}>
            <Text style={styles.statusBadge}>{item.status}</Text>
            <Text style={styles.viewDetailsText}>Tap to View Details →</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={["#FEEDE6", "#FFFFFF"]} style={styles.gradient}>
      <View style={styles.container}>
        {/* Custom Tabs */}
        <View style={styles.tabContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} orders right now.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            renderItem={renderOrderCard}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 50,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeTab: {
    backgroundColor: Colors.default.primary,
    borderColor: Colors.default.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: Colors.default.white,
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginBottom: 10,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderTime: {
    fontSize: 12,
    color: '#888',
  },
  cardBody: {
    marginBottom: 15,
  },
  orderItems: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  btn: {
    flexDirection: 'row',
    flex: 0.48,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnIcon: {
    marginRight: 5,
  },
  acceptBtn: {
    backgroundColor: Colors.default.primary,
  },
  acceptText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  rejectBtn: {
    backgroundColor: '#ffe6e6',
    borderWidth: 1,
    borderColor: '#ffcccb',
  },
  rejectText: {
    color: Colors.default.primary,
    fontWeight: 'bold',
  },
  statusBadge: {
    backgroundColor: '#fff3e0',
    color: '#e65100',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  viewDetailsText: {
    fontSize: 13,
    color: 'gray',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  }
});
