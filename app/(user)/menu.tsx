import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { useSelector } from "react-redux";
import apiClient from "../../api/client";
import { Colors } from "../../constants/theme";

interface CategoryOption {
  id: number;
  name: string;
  image?: string;
  description?: string;
  isAvailable?: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  price: string;
  category: string;
  description?: string;
  isVeg: boolean;
}

const CATEGORY_ITEMS_ENDPOINT = "/api/categoryItems";
const CREATE_MENU_ITEM_ENDPOINT = "/api/menu-items";

export default function MenuScreen() {
  const { id: restaurantId } = useSelector((state: any) => state.auth);

  const [items, setItems] = useState<MenuItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(
    null,
  );
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsVeg, setFormIsVeg] = useState(true);

  const [errors, setErrors] = useState<{
    category?: string;
    name?: string;
    price?: string;
    description?: string;
  }>({});

  const fetchCategories = useCallback(async () => {
    setIsFetchingCategories(true);

    try {
      const response = await apiClient.get(CATEGORY_ITEMS_ENDPOINT, {
        headers: { accept: "*/*" },
      });

      const source = Array.isArray(response.data?.data) ? response.data.data : [];
      const availableCategories = source
        .map((item: any) => ({
          id: Number(item.id),
          name: item.name,
          image: item.image,
          description: item.description,
          isAvailable: item.isAvailable,
        }))
        .filter((item: CategoryOption) => item.name);

      setCategories(availableCategories);
    } catch (error) {
      console.error("Unable to load categories", error);
      setCategories([]);
      Alert.alert("Unable to load categories", "Please try again later.");
    } finally {
      setIsFetchingCategories(false);
    }
  }, []);

  const resetForm = () => {
    setSelectedCategory(null);
    setFormName("");
    setFormPrice("");
    setFormDescription("");
    setFormIsVeg(true);
    setErrors({});
  };

  const handleOpenAdd = async () => {
    resetForm();
    setModalVisible(true);
    await fetchCategories();
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const validateForm = () => {
    const nextErrors: {
      category?: string;
      name?: string;
      price?: string;
      description?: string;
    } = {};

    if (!selectedCategory) nextErrors.category = "Select a category";
    if (!formName.trim()) nextErrors.name = "Item name is required";
    if (!formPrice.trim()) nextErrors.price = "Price is required";
    else if (Number.isNaN(Number(formPrice))) {
      nextErrors.price = "Price must be a valid number";
    }
    if (!formDescription.trim()) {
      nextErrors.description = "Description is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = {
      restaurantId,
      categoryId: selectedCategory?.id,
      categoryName: selectedCategory?.name,
      name: formName.trim(),
      price: Number(formPrice),
      description: formDescription.trim(),
      isVeg: formIsVeg,
    };

    setIsSaving(true);

    try {
      const response = await apiClient.post(CREATE_MENU_ITEM_ENDPOINT, payload);
      const createdItem = response.data?.data || response.data;

      setItems((currentItems) => [
        ...currentItems,
        {
          id: String(createdItem?.id ?? Date.now()),
          name: createdItem?.name ?? formName.trim(),
          price: String(createdItem?.price ?? formPrice),
          category: createdItem?.categoryName ?? selectedCategory?.name ?? "",
          description: createdItem?.description ?? formDescription.trim(),
          isVeg: createdItem?.isVeg ?? formIsVeg,
        },
      ]);

      handleCloseModal();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        `Unable to create item. Check ${CREATE_MENU_ITEM_ENDPOINT}.`;
      Alert.alert("Create Item Failed", message);
    } finally {
      setIsSaving(false);
    }
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
      <Text style={styles.itemCategory}>{item.category}</Text>
      {item.description ? (
        <Text style={styles.itemDescription}>{item.description}</Text>
      ) : null}
    </View>
  );

  return (
    <LinearGradient colors={["#FEEDE6", "#FFFFFF"]} style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Menu Items</Text>
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="restaurant-outline"
                size={42}
                color={Colors.default.primary}
              />
              <Text style={styles.emptyTitle}>No menu items yet</Text>
              <Text style={styles.emptyText}>
                Tap Add Item to load categories from the API and create your first
                menu item.
              </Text>
            </View>
          }
        />

        <Modal visible={modalVisible} animationType="slide" transparent>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Menu Item</Text>
                <TouchableOpacity onPress={handleCloseModal}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Category</Text>
                {isFetchingCategories ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.default.primary}
                    style={styles.loadingIndicator}
                  />
                ) : categories.length ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                  >
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryChip,
                          selectedCategory?.id === category.id &&
                            styles.categoryChipActive,
                        ]}
                        onPress={() => {
                          setSelectedCategory(category);
                          setErrors((prev) => ({
                            ...prev,
                            category: undefined,
                          }));
                        }}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            selectedCategory?.id === category.id &&
                              styles.categoryChipTextActive,
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.helperText}>No categories available.</Text>
                )}
                {errors.category ? (
                  <Text style={styles.errorText}>{errors.category}</Text>
                ) : null}

                <Text style={styles.label}>Item Name</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="e.g. Chicken Kottu"
                  value={formName}
                  onChangeText={(value) => {
                    setFormName(value);
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                />
                {errors.name ? (
                  <Text style={styles.errorText}>{errors.name}</Text>
                ) : null}

                <Text style={styles.label}>Price (Rs.)</Text>
                <TextInput
                  style={[styles.input, errors.price && styles.inputError]}
                  placeholder="e.g. 600"
                  keyboardType="numeric"
                  value={formPrice}
                  onChangeText={(value) => {
                    setFormPrice(value);
                    setErrors((prev) => ({ ...prev, price: undefined }));
                  }}
                />
                {errors.price ? (
                  <Text style={styles.errorText}>{errors.price}</Text>
                ) : null}

                <Text style={styles.label}>Description</Text>
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
                  onChangeText={(value) => {
                    setFormDescription(value);
                    setErrors((prev) => ({ ...prev, description: undefined }));
                  }}
                />
                {errors.description ? (
                  <Text style={styles.errorText}>{errors.description}</Text>
                ) : null}

                <Text style={styles.label}>Food Type</Text>
                <View style={styles.vegToggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.vegBtn,
                      formIsVeg && styles.vegBtnActiveLine,
                    ]}
                    onPress={() => setFormIsVeg(true)}
                  >
                    <MaterialCommunityIcons
                      name="leaf"
                      size={18}
                      color={formIsVeg ? "#4CAF50" : "#888"}
                    />
                    <Text style={styles.vegBtnText}>Veg</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.vegBtn,
                      !formIsVeg && styles.nonVegBtnActiveLine,
                    ]}
                    onPress={() => setFormIsVeg(false)}
                  >
                    <MaterialCommunityIcons
                      name="food-drumstick"
                      size={18}
                      color={!formIsVeg ? "#F44336" : "#888"}
                    />
                    <Text style={styles.vegBtnText}>Non-Veg</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.saveBtnText}>Save Item</Text>
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    </>
                  )}
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
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2A211D",
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
  listContent: { paddingBottom: 100, flexGrow: 1 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 120,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "700",
    color: "#2A211D",
  },
  emptyText: {
    marginTop: 8,
    textAlign: "center",
    color: "#7A6C65",
    lineHeight: 20,
  },
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
  itemHeader: { marginBottom: 10 },
  itemTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  itemName: { fontSize: 18, fontWeight: "bold", color: "#333", marginLeft: 8 },
  itemPrice: { fontSize: 16, color: "#666", marginTop: 5 },
  itemCategory: { color: Colors.default.primary, fontWeight: "600" },
  itemDescription: { color: "#666", marginTop: 8, lineHeight: 20 },
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
  loadingIndicator: { marginTop: 5, marginBottom: 10 },
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
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
});
