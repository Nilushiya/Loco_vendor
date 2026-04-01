import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function AnalyticsScreen() {
  const topItems = [
    { id: '1', name: 'Chicken Rice', qty: 45 },
    { id: '2', name: 'Kottu', qty: 32 },
  ];

  return (
    <LinearGradient colors={["#FEEDE6", "#FFFFFF"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today Sales</Text>
          <Text style={styles.salesValue}>Rs. 12,500</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Sales Graph</Text>
          <View style={styles.graphPlaceholder}>
            {/* Simple bar chart mockup */}
            <View style={styles.chartArea}>
              <View style={[styles.bar, { height: '40%' }]} />
              <View style={[styles.bar, { height: '60%' }]} />
              <View style={[styles.bar, { height: '90%' }]} />
              <View style={[styles.bar, { height: '50%' }]} />
              <View style={[styles.bar, { height: '70%' }]} />
              <View style={[styles.bar, { height: '30%' }]} />
              <View style={[styles.bar, { height: '80%' }]} />
            </View>
            <View style={styles.chartLabels}>
              <Text style={styles.chartLabelText}>Mon</Text>
              <Text style={styles.chartLabelText}>Tue</Text>
              <Text style={styles.chartLabelText}>Wed</Text>
              <Text style={styles.chartLabelText}>Thu</Text>
              <Text style={styles.chartLabelText}>Fri</Text>
              <Text style={styles.chartLabelText}>Sat</Text>
              <Text style={styles.chartLabelText}>Sun</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Items</Text>
          {topItems.map((item, index) => (
            <View key={item.id} style={styles.topItemRow}>
              <Text style={styles.topItemName}>{index + 1}. {item.name}</Text>
              <Text style={styles.topItemQty}>{item.qty} sold</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 20, paddingTop: 50 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#555', marginBottom: 10 },
  salesValue: { fontSize: 32, fontWeight: 'bold', color: Colors.default.primary },
  
  graphPlaceholder: {
    height: 200,
    marginTop: 10,
  },
  chartArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bar: {
    width: 25,
    backgroundColor: 'rgba(255,140,0, 0.6)', // matching primary tint
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 8,
  },
  chartLabelText: {
    fontSize: 12,
    color: '#888',
  },

  topItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  topItemName: { fontSize: 16, color: '#333', fontWeight: '500' },
  topItemQty: { fontSize: 16, color: '#888' },
});
