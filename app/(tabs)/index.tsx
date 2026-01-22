import { Link, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import Graphics from "../../components/acceuil/Graphics";
import "../global.css";

export default function Accueil() {
    const router = useRouter();

    return (
        <ScrollView className="flex-1 bg-dark-primary px-5 pt-16">
            <Text className="text-xl text-white font-bold mb-4 text-center">
                Bienvenue !
            </Text>

            {/* --- Zone Graphique --- */}
            <Graphics
                title="Temps d’étude"
                values={[25, 54, 73, 38, 95, 40, 66]}
                labels={["L", "M", "M", "J", "V", "S", "D"]}
                height={130}
            />

            {/* --- Stats rapides (placeholder) --- */}
            <View className="rounded-2xl bg-violet-100 p-4 mb-3">
                <Text className="text-neutral-600">Série actuelle :</Text>
                <Text className="text-2xl font-semibold text-violet-600">3 jours</Text>
            </View>

            <View className="rounded-2xl bg-violet-100 p-4 mb-3">
                <Text className="text-neutral-600">Temps d’étude cette semaine :</Text>
                <Text className="text-2xl font-semibold text-violet-600">240 min</Text>
            </View>

            <View className="rounded-2xl bg-violet-100 p-4 mb-3">
                <Text className="text-neutral-600">Moyenne actuelle :</Text>
                <Text className="text-2xl font-semibold text-violet-600">72%</Text>
            </View>

            {/* --- Actions --- */}
            <Pressable
                onPress={() => router.push("/(tabs)/pomodoro")}
                className="mt-5 rounded-2xl bg-violet-600 py-4"
            >
                <Text className="text-white text-center font-semibold">
                    Démarrer un Pomodoro
                </Text>
            </Pressable>

            <Link href="/(tabs)/donnees" asChild>
                <Pressable className="mt-3 rounded-2xl border border-violet-200 py-4">
                    <Text className="text-center font-medium">Voir mes données</Text>
                </Pressable>
            </Link>

            <View className="h-10" />
        </ScrollView>
    );
}