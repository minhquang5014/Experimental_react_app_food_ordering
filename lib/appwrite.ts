import { Client, Account, Databases, Avatars, ID } from "react-native-appwrite";
import { CreateUserProps, SignInParams } from "@/type";
import { Query } from "react-native-appwrite";

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    platform: "com.tommy.foodordering",
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    databaseID: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    usersCollectionID: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID,
}

export const client = new Client()

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)

export const account = new Account(client);
export const databases = new Databases(client);
const avatars = new Avatars(client);

export const createUser = async ({email, password, name}: CreateUserProps) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, name);
        const newAccountID = newAccount.$id;
        if(!newAccount) throw Error('Failed to create account');
        await SignInWithEmailPassword({ email, password });
        
        const avatarURL = avatars.getInitialsURL(name);
        const newUser = await databases.createDocument(
            appwriteConfig.databaseID!,
            appwriteConfig.usersCollectionID!,
            ID.unique(),
            {email, name, newAccountID, avatarURL}
        )
        return newUser;
    } catch (error) {
        throw new Error(error as string);
    }
}

export const SignInWithEmailPassword = async ({ email, password }: SignInParams) => {
    try {
        try {
            await account.deleteSession('current');
        } catch (_) {}
        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (error) {
        console.log(error);
        throw new Error(error as string);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentUser = await account.get();
        if (!currentUser) throw new Error('No user logged in');
        const currentUserID = await databases.listDocuments(
            appwriteConfig.databaseID!,
            appwriteConfig.usersCollectionID!,
            [Query.equal('accountID', [currentUser.$id])]
        );
        if (!currentUserID) throw Error;
        return currentUserID.documents[0];

    } catch (e) {
        console.log(e);
        throw new Error(e as string);
    }
}