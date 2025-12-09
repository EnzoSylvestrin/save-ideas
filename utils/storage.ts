import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_PROJECT_KEY = '@save-ideas:last-project-id';

export async function getLastProjectId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_PROJECT_KEY);
  } catch (error) {
    console.error('Error getting last project:', error);
    return null;
  }
}

export async function setLastProjectId(projectId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_PROJECT_KEY, projectId);
  } catch (error) {
    console.error('Error saving last project:', error);
  }
}

