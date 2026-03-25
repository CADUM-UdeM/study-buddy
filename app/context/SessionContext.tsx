import AsyncStorage from '@react-native-async-storage/async-storage';


const key_session = '@sessions_history';

export const sessionContext = {
    async getSessionsAsync() {
            try {
                const stored = await AsyncStorage.getItem(key_session);
                return stored ? JSON.parse(stored) : [];
            }
            catch (error) {
                console.log(error);
                return [];
            }
    },
}