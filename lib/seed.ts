import { ID } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
    name: string;
    description: string;
}

interface Customization {
    name: string;
    price: number;
    type: "topping" | "side" | "size" | "crust" | string; // extend as needed
}

interface MenuItem {
    name: string;
    description: string;
    image_url: string;
    price: number;
    rating: number;
    calories: number;
    protein: number;
    category_name: string;
    customizations: string[]; // list of customization names
}

interface DummyData {
    categories: Category[];
    customizations: Customization[];
    menu: MenuItem[];
}

// ensure dummyData has correct shape
const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
    const list = await databases.listDocuments(
        appwriteConfig.databaseID,
        collectionId
    );

    await Promise.all(
        list.documents.map((doc) =>
            databases.deleteDocument(appwriteConfig.databaseID, collectionId, doc.$id)
        )
    );
    console.log(`Cleared collection ${collectionId}.`);
}

async function clearStorage(): Promise<void> {
    const list = await storage.listFiles(appwriteConfig.bucketID);

    await Promise.all(
        list.files.map((file) =>
            storage.deleteFile(appwriteConfig.bucketID, file.$id)
        )
    );
    console.log("Storage cleared.");
}

async function uploadImageToStorage(imageUrl: string) {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        // const arrayBuffer = await blob.arrayBuffer();

        const fileObj = {
            name: imageUrl.split("/").pop() || `file-${Date.now()}.jpg`,
            type: "image/png",
            size: blob.size,
            uri: imageUrl,
        };
        console.log(`Created file object:`, fileObj);
        console.log(`Image name: ${fileObj.name}, type: ${fileObj.type}, size: ${fileObj.size}`);
        const file = await storage.createFile(
            appwriteConfig.bucketID,
            ID.unique(),
            fileObj
        );
        console.log(`Uploaded ${imageUrl} to storage with ID: ${file.$id}`);
        return storage.getFileViewURL(appwriteConfig.bucketID, file.$id);

    } catch (error) {
        console.error(`Error uploading image ${imageUrl}:`, error);
        throw error; // rethrow to handle upstream
    }
}

async function uploadImageFromLocal(imageUrl: string) {
    try {
        const fileObj = {
            name: imageUrl.split("/").pop() || `file-${Date.now()}.jpg`,
            type: "image/png", // or determine type based on file extension
            size: 1234567,
            uri: imageUrl,
        };
        console.log(`Created file object:`, fileObj);
        console.log(`Image name: ${fileObj.name}, type: ${fileObj.type}, size: ${fileObj.size}`);
        const file = await storage.createFile(
            appwriteConfig.bucketID,
            ID.unique(),
            fileObj
        );
        console.log(`Uploaded ${imageUrl} to storage with ID: ${file.$id}`);
        return storage.getFileViewURL(appwriteConfig.bucketID, file.$id);

    } catch (error) {
        console.error(`Error uploading image ${imageUrl}:`, error);
        throw error; // rethrow to handle upstream
    }
}

async function seed(): Promise<void> {
    // 1. Clear all
    await clearAll(appwriteConfig.categoryCollectionID!);
    await clearAll(appwriteConfig.customizationCollectionID!);
    await clearAll(appwriteConfig.menuCollectionID!);
    await clearAll(appwriteConfig.menuCustomizationCollectionID!);
    await clearStorage();

    // 2. Create Categories
    const categoryMap: Record<string, string> = {};
    for (const cat of data.categories) {
        const doc = await databases.createDocument(
            appwriteConfig.databaseID,
            appwriteConfig.categoryCollectionID!,
            ID.unique(),
            cat
        );
        categoryMap[cat.name] = doc.$id;
    }
    console.log("✅ Categories created.");

    // 3. Create Customizations
    const customizationMap: Record<string, string> = {};
    for (const cus of data.customizations) {
        const doc = await databases.createDocument(
            appwriteConfig.databaseID,
            appwriteConfig.customizationCollectionID!,
            ID.unique(),
            {
                name: cus.name,
                price: cus.price,
                type: cus.type,
            }
        );
        customizationMap[cus.name] = doc.$id;
    }
    console.log("✅ Customizations created.");

    // 4. Create Menu Items
    const menuMap: Record<string, string> = {};
    for (const item of data.menu) {
        console.log(`Creating menu item: ${item.name}...`);
        const uploadedImage = await uploadImageToStorage(item.image_url);

        const doc = await databases.createDocument(
            appwriteConfig.databaseID,
            appwriteConfig.menuCollectionID!,
            ID.unique(),
            {
                name: item.name,
                description: item.description,
                image_url: uploadedImage,
                price: item.price,
                rating: item.rating,
                calories: item.calories,
                protein: item.protein,
                categories: categoryMap[item.category_name],
            }
        );

        menuMap[item.name] = doc.$id;
        console.log(`Menu item "${item.name}" created with ID: ${doc.$id}.`);

        // 5. Create menu_customizations
        for (const cusName of item.customizations) {
            await databases.createDocument(
                appwriteConfig.databaseID,
                appwriteConfig.menuCustomizationCollectionID!,
                ID.unique(),
                {
                    menu: doc.$id,
                    customizations: customizationMap[cusName],
                }
            );
        }
        console.log(`✅ Menu item "${item.name}" created with customizations.`);
    }

    console.log("✅ Seeding complete.");
}

export default seed;