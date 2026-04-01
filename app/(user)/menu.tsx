import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import apiClient from "../../api/client";
import { Colors } from "../../constants/theme";

interface MenuItem {
  id: string;
  name: string;
  price: string;
  category: string;
  isVeg: boolean;
  image?: string;
  description?: string;
}

export type FoodOption = {
  name: string;
  image?: string;
};

export default function MenuScreen() {
  const [items, setItems] = useState<MenuItem[]>([
    {
      id: "1",
      name: "Chicken Rice",
      price: "600",
      category: "Main Course",
      isVeg: false,
      description: "Savory rice bowl with tender chicken.",
      image: "https://via.placeholder.com/120x80.png?text=Chicken+Rice",
    },
    {
      id: "2",
      name: "Coke",
      price: "200",
      category: "Beverages",
      isVeg: true,
      description: "Chilled cola drink.",
      image: "https://via.placeholder.com/120x80.png?text=Coke",
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formPrice, setFormPrice] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsVeg, setFormIsVeg] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodOption | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [foodOptions, setFoodOptions] = useState<FoodOption[]>([]);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [isFetchingFoods, setIsFetchingFoods] = useState(false);

  const [errors, setErrors] = useState<{
    category?: string;
    food?: string;
    price?: string;
    description?: string;
  }>({});

  const fetchCategories = useCallback(async () => {
    setIsFetchingCategories(true);
    try {
      const response = await apiClient.get("/vendor/categories");
      const payload = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.categories)
          ? response.data.categories
          : [];
      setCategories(payload);
    } catch (error) {
      console.error("Unable to load categories", error);
      Alert.alert("Unable to load categories", "Please try again later.");
      setCategories([]);
    } finally {
      setIsFetchingCategories(false);
    }
  }, []);

  const fetchFoods = useCallback(async (category: string) => {
    setIsFetchingFoods(true);
    try {
      const response = await apiClient.get(
        `/vendor/categories/${encodeURIComponent(category)}/foods`,
      );
      const payload = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.foods)
          ? response.data.foods
          : [];
      setFoodOptions(payload);
    } catch (error) {
      console.error("Unable to load foods", error);
      Alert.alert("Unable to load foods", "Please try again later.");
      setFoodOptions([]);
    } finally {
      setIsFetchingFoods(false);
    }
  }, []);

  useEffect(() => {
    if (modalVisible) {
      fetchCategories();
    }
  }, [modalVisible, fetchCategories]);

  useEffect(() => {
    if (selectedCategory) {
      setSelectedFood(null);
      fetchFoods(selectedCategory);
    } else {
      setFoodOptions([]);
    }
  }, [selectedCategory, fetchFoods]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormPrice("");
    setFormDescription("");
    setFormIsVeg(true);
    setSelectedCategory(null);
    setSelectedFood(null);
    setFoodOptions([]);
    setErrors({});
    setModalVisible(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setFormPrice(item.price);
    setFormDescription(item.description ?? "");
    setFormIsVeg(item.isVeg);
    setSelectedCategory(item.category);
    setSelectedFood({ name: item.name, image: item.image });
    setErrors({});
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this specific item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setItems(items.filter((i) => i.id !== id)),
        },
      ],
    );
  };

  const handleSave = () => {
    const newErrors: {
      category?: string;
      food?: string;
      price?: string;
      description?: string;
    } = {};
    if (!selectedCategory) newErrors.category = "Select a category";
    if (!selectedFood) newErrors.food = "Pick a food item";
    if (!formPrice.trim()) newErrors.price = "Price is required";
    else if (isNaN(Number(formPrice)))
      newErrors.price = "Price must be a valid number";
    if (!formDescription.trim())
      newErrors.description = "Description is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const itemToSave: MenuItem = {
      id: editingId ?? Math.random().toString(),
      name: selectedFood?.name ?? "New Dish",
      price: formPrice,
      category: selectedCategory ?? "Uncategorized",
      isVeg: formIsVeg,
      description: formDescription,
      image: selectedFood?.image,
    };

    if (editingId) {
      setItems(
        items.map((item) => (item.id === editingId ? itemToSave : item)),
      );
    } else {
      setItems([...items, itemToSave]);
    }

    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemTitleRow}>
          <MaterialCommunityIcons
            name={item.isVeg ? "leaf" : "food-drumstick"}
            size={20}
            color={item.isVeg ? "#4CAF50" : "#F44336"}
          />
          <Text style={styles.itemName}>{item.name}</Text>
        </View>
        <Text style={styles.itemPrice}>Rs. {item.price}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => handleOpenEdit(item)}
        >
          <Ionicons name="pencil" size={16} color={Colors.default.primary} />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash" size={16} color="#F44336" />
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={["#FEEDE6", "#FFFFFF"]} style={styles.gradient}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Add New Item</Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Add/Edit Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingId ? "Edit Item" : "Add New Item"}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Category</Text>
                {isFetchingCategories ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.default.primary}
                    style={{ marginTop: 5, marginBottom: 10 }}
                  />
                ) : categories.length ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                  >
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryChip,
                          selectedCategory === cat && styles.categoryChipActive,
                        ]}
                        onPress={() => {
                          setSelectedCategory(cat);
                          setErrors((prev) => ({
                            ...prev,
                            category: undefined,
                            food: undefined,
                          }));
                        }}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            selectedCategory === cat &&
                              styles.categoryChipTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.helperText}>
                    No categories available yet.
                  </Text>
                )}
                {errors.category && (
                  <Text style={styles.errorText}>{errors.category}</Text>
                )}

                {selectedCategory && (
                  <>
                    <Text style={styles.label}>Select Food</Text>
                    {isFetchingFoods ? (
                      <ActivityIndicator
                        size="small"
                        color={Colors.default.primary}
                        style={{ marginTop: 5, marginBottom: 10 }}
                      />
                    ) : foodOptions.length ? (
                      <View style={styles.foodOptionsRow}>
                        {foodOptions.map((food) => (
                          <TouchableOpacity
                            key={food.name}
                            style={[
                              styles.foodOption,
                              selectedFood?.name === food.name &&
                                styles.foodOptionActive,
                            ]}
                            onPress={() => {
                              setSelectedFood(food);
                              setErrors((prev) => ({
                                ...prev,
                                food: undefined,
                              }));
                            }}
                          >
                            {food.image ? (
                              <Image
                                source={{ uri: food.image }}
                                style={styles.foodOptionImage}
                              />
                            ) : (
                              <View style={styles.foodOptionImagePlaceholder}>
                                <Text style={styles.foodOptionPlaceholderText}>
                                  {food.name.slice(0, 2).toUpperCase()}
                                </Text>
                              </View>
                            )}
                            <Text style={styles.foodOptionText}>
                              {food.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.helperText}>
                        No foods found for this category.
                      </Text>
                    )}
                    {errors.food && (
                      <Text style={styles.errorText}>{errors.food}</Text>
                    )}
                  </>
                )}

                {selectedFood && (
                  <View style={styles.selectedFoodPreview}>
                    {selectedFood.image ? (
                      <Image
                        source={{ uri: selectedFood.image }}
                        style={styles.selectedFoodImage}
                      />
                    ) : (
                      <View style={styles.foodOptionImagePlaceholder}>
                        <Text style={styles.foodOptionPlaceholderText}>
                          {selectedFood.name.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.selectedFoodName}>
                      Selected: {selectedFood.name}
                    </Text>
                  </View>
                )}

                <Text style={styles.label}>Price (Rs.)</Text>
                <TextInput
                  style={[styles.input, errors.price && styles.inputError]}
                  placeholder="e.g. 600"
                  keyboardType="numeric"
                  value={formPrice}
                  onChangeText={setFormPrice}
                />
                {errors.price && (
                  <Text style={styles.errorText}>{errors.price}</Text>
                )}

                <Text style={styles.label}>Food Description</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.descriptionInput,
                    errors.description && styles.inputError,
                  ]}
                  placeholder="Add a short description"
                  multiline
                  numberOfLines={3}
                  value={formDescription}
                  onChangeText={setFormDescription}
                />
                {errors.description && (
                  <Text style={styles.errorText}>{errors.description}</Text>
                )}

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>Save Item</Text>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  addBtn: {
    flexDirection: "row",
    backgroundColor: Colors.default.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "bold", marginLeft: 5 },
  listContent: { paddingBottom: 100 },

  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  itemHeader: { marginBottom: 15 },
  itemTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  itemName: { fontSize: 18, fontWeight: "bold", color: "#333", marginLeft: 8 },
  itemPrice: { fontSize: 16, color: "#666", marginTop: 5 },

  itemActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
  },
  editBtn: { flexDirection: "row", alignItems: "center", marginRight: 20 },
  editBtnText: {
    color: Colors.default.primary,
    fontWeight: "bold",
    marginLeft: 5,
  },
  deleteBtn: { flexDirection: "row", alignItems: "center" },
  deleteBtnText: { color: "#F44336", fontWeight: "bold", marginLeft: 5 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 22, fontWeight: "bold", color: "#333" },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  inputError: { borderColor: "#F44336" },
  errorText: { color: "#F44336", fontSize: 12, marginTop: 5 },
  helperText: { color: "#888", fontSize: 13, marginBottom: 10 },

  categoryScroll: { flexDirection: "row", marginBottom: 10 },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  categoryChipActive: { backgroundColor: Colors.default.primary },
  categoryChipText: { color: "#666", fontWeight: "600" },
  categoryChipTextActive: { color: "#fff" },

  foodOptionsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  foodOption: {
    width: 120,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 12,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  foodOptionActive: {
    borderColor: Colors.default.primary,
    shadowColor: Colors.default.primary,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  foodOptionImage: { width: 60, height: 60, borderRadius: 10, marginBottom: 8 },
  foodOptionImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  foodOptionPlaceholderText: { color: "#666", fontWeight: "bold" },
  foodOptionText: { fontSize: 12, color: "#333", textAlign: "center" },

  selectedFoodPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  selectedFoodImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  selectedFoodName: { fontWeight: "600", color: "#333" },

  descriptionInput: { minHeight: 80, textAlignVertical: "top" },

  vegToggleContainer: { flexDirection: "row", justifyContent: "space-between" },
  vegBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginHorizontal: 5,
  },
  vegBtnActiveLine: { borderColor: "#4CAF50", backgroundColor: "#e8f5e9" },
  nonVegBtnActiveLine: { borderColor: "#F44336", backgroundColor: "#ffebee" },
  vegBtnText: { fontWeight: "bold", marginLeft: 8, color: "#888" },

  saveBtn: {
    backgroundColor: Colors.default.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 20,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
});
