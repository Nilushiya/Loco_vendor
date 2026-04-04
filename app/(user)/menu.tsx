import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { useSelector } from "react-redux";
import apiClient from "../../api/client";
import { BASE_URL } from "../../constants/Config";
import { Colors } from "../../constants/theme";

interface CategoryOption {
  id: number;
  name: string;
  image?: string;
  description?: string;
  isAvailable?: boolean;
}

interface DefaultItem {
  id: number;
  name: string;
  description?: string;
  image?: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: string;
  category: string;
  description?: string;
  isVeg: boolean;
  image?: string;
}

const CATEGORY_ITEMS_ENDPOINT = "/api/categoryItems";
const DEFAULT_ITEMS_BY_CATEGORY_ENDPOINT = "/api/defaultItems/category";
const CREATE_MENU_ITEM_ENDPOINT = "/item/create";
const GET_RESTAURANT_ITEMS_ENDPOINT = "/item/get/restaurant";

const getImagePreviewUri = (image: any) => {
  if (!image) {
    return null;
  }

  if (typeof image === "string") {
    return image.startsWith("http") ? image : `${BASE_URL}/${image}`;
  }

  return image.uri || image.fileCopyUri || null;
};

const normalizePickedImage = (asset: any) => {
  if (!asset?.uri && !asset?.fileCopyUri) {
    return null;
  }

  const uri = asset.fileCopyUri || asset.uri;
  const fileName = asset.fileName || asset.name || "menu-item.jpg";
  const type = asset.mimeType || asset.type || "image/jpeg";

  return {
    uri,
    name: fileName,
    type,
  };
};

export default function MenuScreen() {
  const { id: restaurantId } = useSelector((state: any) => state.auth);

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [defaultItems, setDefaultItems] = useState<DefaultItem[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [isFetchingDefaultItems, setIsFetchingDefaultItems] = useState(false);
  const [isFetchingItems, setIsFetchingItems] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<DefaultItem | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<any>(null);
  const [formIsVeg, setFormIsVeg] = useState(true);

  const [errors, setErrors] = useState<{
    categoryId?: string;
    selectedItem?: string;
    name?: string;
    price?: string;
    description?: string;
  }>({});

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId) ?? null,
    [categories, categoryId],
  );

  const fetchRestaurantItems = useCallback(async () => {
    if (!restaurantId) {
      setItems([]);
      return;
    }

    setIsFetchingItems(true);

    try {
      const response = await apiClient.get(
        `${GET_RESTAURANT_ITEMS_ENDPOINT}/${restaurantId}`,
        {
          headers: { accept: "*/*" },
        },
      );

      const source = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : [];

      const normalizedItems = source.map((item: any) => ({
        id: String(item.id),
        name: item.name ?? "",
        price: String(item.price ?? ""),
        category:
          item.categoryName ??
          item.category?.name ??
          item.category?.categoryName ??
          "Uncategorized",
        description: item.description ?? "",
        isVeg:
          typeof item.isVeg === "boolean"
            ? item.isVeg
            : typeof item.availability === "boolean"
              ? item.availability
              : true,
        image: item.image ?? item.imageUrl ?? undefined,
      }));

      setItems(normalizedItems);
    } catch (error) {
      console.error("Unable to load restaurant items", error);
      setItems([]);
      Alert.alert("Unable to load menu items", "Please try again later.");
    } finally {
      setIsFetchingItems(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchRestaurantItems();
  }, [fetchRestaurantItems]);

  const fetchCategories = useCallback(async () => {
    setIsFetchingCategories(true);

    try {
      const response = await apiClient.get(CATEGORY_ITEMS_ENDPOINT, {
        headers: { accept: "*/*" },
      });

      const source = Array.isArray(response.data?.data) ? response.data.data : [];
      const normalized = source
        .map((item: any) => ({
          id: Number(item.id),
          name: item.name,
          image: item.image,
          description: item.description,
          isAvailable: item.isAvailable,
        }))
        .filter((item: CategoryOption) => item.id && item.name);

      setCategories(normalized);
    } catch (error) {
      console.error("Unable to load categories", error);
      setCategories([]);
      Alert.alert("Unable to load categories", "Please try again later.");
    } finally {
      setIsFetchingCategories(false);
    }
  }, []);

  const fetchDefaultItems = useCallback(async (selectedCategoryId: number) => {
    setIsFetchingDefaultItems(true);

    try {
      const response = await axios.get(
        `${BASE_URL}${DEFAULT_ITEMS_BY_CATEGORY_ENDPOINT}?categoryId=${selectedCategoryId}`,
      );
      console.log("Default items response:", response.data);
      const source = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : [];

      const normalized = source
        .map((item: any) => ({
          id: Number(item.id),
          name: item.name,
          description: item.description,
          image: item.image,
        }))
        .filter((item: DefaultItem) => item.id && item.name);

      setDefaultItems(normalized);
    } catch (error) {
      console.error("Unable to load default items", error);
      setDefaultItems([]);
      Alert.alert("Unable to load items", "Please try again later.");
    } finally {
      setIsFetchingDefaultItems(false);
    }
  }, []);

  const resetForm = () => {
    setCategoryId(null);
    setSelectedItem(null);
    setDefaultItems([]);
    setName("");
    setPrice("");
    setDescription("");
    setImage(null);
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

  const handleSelectCategory = async (category: CategoryOption) => {
    setCategoryId(category.id);
    setSelectedItem(null);
    setDefaultItems([]);
    setName("");
    setDescription("");
    setImage(null);
    setErrors((prev) => ({
      ...prev,
      categoryId: undefined,
      selectedItem: undefined,
      name: undefined,
      description: undefined,
    }));

    await fetchDefaultItems(category.id);
  };

  const handleSelectItem = (item: DefaultItem) => {
    setSelectedItem(item);
    setName(item.name);
    setDescription(item.description || "");
    setImage(item.image || null);
    setErrors((prev) => ({
      ...prev,
      selectedItem: undefined,
      name: undefined,
      description: undefined,
    }));
  };

  const handleReplaceImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Please allow image access to continue.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      setImage(normalizePickedImage(result.assets[0]));
    }
  };

  const validateForm = () => {
    const nextErrors: {
      categoryId?: string;
      selectedItem?: string;
      name?: string;
      price?: string;
      description?: string;
    } = {};

    if (!categoryId) nextErrors.categoryId = "Select a category";
    if (!selectedItem) nextErrors.selectedItem = "Select an item";
    if (!name.trim()) nextErrors.name = "Item name is required";
    if (!price.trim()) nextErrors.price = "Price is required";
    else if (Number.isNaN(Number(price))) nextErrors.price = "Price must be a valid number";
    if (!description.trim()) nextErrors.description = "Description is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!restaurantId) {
      Alert.alert("Missing Restaurant", "Please log in again and try once more.");
      return;
    }

    if (!selectedCategory?.id) {
      Alert.alert("Missing Category", "Please select a category and try again.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("price", String(price.trim()));
    formData.append("description", description.trim());
    formData.append("availability", String(formIsVeg ? true : false));
    formData.append("restaurantId", String(restaurantId));
    formData.append("categoryId", String(selectedCategory.id));

    if (image && typeof image !== "string" && image.uri) {
      formData.append("image", image);
    }

    setIsSaving(true);

    try {
      const response = await apiClient.post(CREATE_MENU_ITEM_ENDPOINT, formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        transformRequest: (data) => data,
      });

      const createdItem = response.data?.data || response.data;
      if (createdItem) {
        setItems((currentItems) => [
          ...currentItems,
          {
            id: String(createdItem?.id ?? Date.now()),
            name: createdItem?.name ?? name.trim(),
            price: String(createdItem?.price ?? price.trim()),
            category: createdItem?.categoryName ?? selectedCategory?.name ?? "",
            description: createdItem?.description ?? description.trim(),
            isVeg: createdItem?.isVeg ?? formIsVeg,
            image: createdItem?.image ?? getImagePreviewUri(image) ?? undefined,
          },
        ]);
      } else {
        await fetchRestaurantItems();
      }

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
      {getImagePreviewUri(item.image) ? (
        <Image
          source={{ uri: getImagePreviewUri(item.image) ?? undefined }}
          style={styles.itemImage}
        />
      ) : (
        <View style={styles.itemImagePlaceholder}>
          <Ionicons name="image-outline" size={26} color="#8C7E76" />
        </View>
      )}
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
          refreshing={isFetchingItems}
          onRefresh={fetchRestaurantItems}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              {isFetchingItems ? (
                <ActivityIndicator size="large" color={Colors.default.primary} />
              ) : (
                <>
                  <Ionicons
                    name="restaurant-outline"
                    size={42}
                    color={Colors.default.primary}
                  />
                  <Text style={styles.emptyTitle}>No menu items yet</Text>
                  <Text style={styles.emptyText}>
                    Tap Add Item to choose a category, load default items, and create
                    your menu entry.
                  </Text>
                </>
              )}
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
                          categoryId === category.id && styles.categoryChipActive,
                        ]}
                        onPress={() => handleSelectCategory(category)}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            categoryId === category.id &&
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
                {errors.categoryId ? (
                  <Text style={styles.errorText}>{errors.categoryId}</Text>
                ) : null}

                <Text style={styles.label}>Item Name</Text>
                {!categoryId ? (
                  <Text style={styles.helperText}>
                    Select a category to load default items.
                  </Text>
                ) : isFetchingDefaultItems ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.default.primary}
                    style={styles.loadingIndicator}
                  />
                ) : defaultItems.length ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                  >
                    {defaultItems.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.categoryChip,
                          selectedItem?.id === item.id && styles.categoryChipActive,
                        ]}
                        onPress={() => handleSelectItem(item)}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            selectedItem?.id === item.id &&
                              styles.categoryChipTextActive,
                          ]}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.helperText}>No items available.</Text>
                )}
                {errors.selectedItem ? (
                  <Text style={styles.errorText}>{errors.selectedItem}</Text>
                ) : null}

                {/* <Text style={styles.label}>Item Name</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="e.g. Chicken Kottu"
                  value={name}
                  onChangeText={(value) => {
                    setName(value);
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                />
                {errors.name ? (
                  <Text style={styles.errorText}>{errors.name}</Text>
                ) : null} */}

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
                  value={description}
                  onChangeText={(value) => {
                    setDescription(value);
                    setErrors((prev) => ({ ...prev, description: undefined }));
                  }}
                />
                {errors.description ? (
                  <Text style={styles.errorText}>{errors.description}</Text>
                ) : null}

                <Text style={styles.label}>Price (Rs.)</Text>
                <TextInput
                  style={[styles.input, errors.price && styles.inputError]}
                  placeholder="e.g. 600"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={(value) => {
                    setPrice(value);
                    setErrors((prev) => ({ ...prev, price: undefined }));
                  }}
                />
                {errors.price ? (
                  <Text style={styles.errorText}>{errors.price}</Text>
                ) : null}

                <Text style={styles.label}>Image</Text>
                {getImagePreviewUri(image) ? (
                  <Image
                    source={{ uri: getImagePreviewUri(image) ?? undefined }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.previewPlaceholder}>
                    <Ionicons name="image-outline" size={28} color="#8C7E76" />
                    <Text style={styles.previewPlaceholderText}>No image selected</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.changeImageBtn}
                  onPress={handleReplaceImage}
                >
                  <Ionicons
                    name="images-outline"
                    size={18}
                    color={Colors.default.primary}
                  />
                  <Text style={styles.changeImageBtnText}>Change Image</Text>
                </TouchableOpacity>
                {typeof image === "string" ? (
                  <Text style={styles.helperText}>
                    Default image is preview-only. Pick a new image if you want to upload one.
                  </Text>
                ) : null}

                {/* <Text style={styles.label}>Food Type</Text>
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
                </View> */}

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
  itemImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: "#EEE",
  },
  itemImagePlaceholder: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: "#F4F0ED",
    alignItems: "center",
    justifyContent: "center",
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
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    backgroundColor: "#EEE",
  },
  previewPlaceholder: {
    height: 180,
    borderRadius: 14,
    backgroundColor: "#F4F0ED",
    alignItems: "center",
    justifyContent: "center",
  },
  previewPlaceholderText: {
    color: "#8C7E76",
    marginTop: 8,
    fontWeight: "600",
  },
  changeImageBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0C6B2",
    backgroundColor: "#FFF4EE",
  },
  changeImageBtnText: {
    color: Colors.default.primary,
    fontWeight: "700",
    marginLeft: 8,
  },
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
