import { Link, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useGPA } from "../../app/hooks/useGPA";
import Graphics from "../../components/accueil/Graphics";
import "../global.css";

export default function Accueil() {
  const router = useRouter();
  const { calculateOverallStats } = useGPA();
  const overallStats = calculateOverallStats();

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

      {/* --- GPA Section --- */}
      {overallStats && (
        <View className="rounded-2xl bg-green-100 p-4 mb-3">
          <Text className="text-neutral-600">GPA Global :</Text>
          <Text className="text-2xl font-semibold text-green-600">
            {overallStats.gpaDisplay}
          </Text>
          <Text className="text-sm text-neutral-500 mt-1">
            {overallStats.courseCount} cours • {overallStats.totalCredits}{" "}
            crédits
          </Text>
        </View>
      )}

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
