import { useState } from "react";
import { View, Text, Pressable, LayoutChangeEvent } from "react-native";

type Props = {
    title?: string;
    values: number[];        // minutes réelles OU 0..1 si scaleMax fourni
    labels?: string[];       // ['L','M','M','J','V','S','D']
    height?: number;         // hauteur utile des barres (hors marge top)
    scaleMax?: number;       // ex: 120 => values est normalisé 0..1
};

export default function Graphics({
                                     title = "Graphique",
                                     values,
                                     labels,
                                     height = 120,
                                     scaleMax,
                                 }: Props) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [chartW, setChartW] = useState(0); // largeur réelle de la zone barres

    const BAR_MIN_H   = 4;
    const TOP_RESERVE = 35;               // marge pour le tooltip
    const chartH      = height + TOP_RESERVE;

    // convertit value -> minutes
    const toMinutes = (v: number) => (scaleMax != null ? v * scaleMax : v);

    // max pour l'échelle Y (minutes)
    const dataMax = scaleMax != null ? scaleMax : Math.max(...values, 1);
    const maxMinutes = Math.max(dataMax, 1);

    // format court: "45 min" | "1h05" | "2h"
    const fmtShort = (mins: number) => {
        const m = Math.round(mins);
        if (m < 60) return `${m} min`;
        const h = Math.floor(m / 60);
        const mm = m % 60;
        return mm ? `${h}h${String(mm).padStart(2, "0")}` : `${h}h`;
    };

    const onChartLayout = (e: LayoutChangeEvent) => {
        setChartW(e.nativeEvent.layout.width);
    };

    // calc util
    const slotW = values.length ? chartW / values.length : 0;      // largeur d'un “slot” de barre
    const barW  = 12;                                              // largeur visuelle de la barre

    // hauteur + position Y du tooltip pour l'index actif
    let tooltipInfo: { left: number; bottom: number; text: string } | null = null;
    if (activeIndex != null && chartW > 0) {
        const mins = toMinutes(values[activeIndex]);
        const ratio = Math.max(0, Math.min(1, mins / maxMinutes));
        const barH  = Math.max(BAR_MIN_H, ratio * height);

        const desiredBottom = TOP_RESERVE + barH + 8;
        const tooltipBottom = Math.min(desiredBottom, chartH - 22);

        // centre X au milieu du slot, puis compense la moitié du tooltip (on mettra width fixe 64)
        const centerX = activeIndex * slotW + slotW / 2;
        const tooltipWidth = 64;
        const left = Math.max(0, Math.min(centerX - tooltipWidth / 2, chartW - tooltipWidth));

        tooltipInfo = { left, bottom: tooltipBottom, text: fmtShort(mins) };
    }

    return (
        <View className="w-full rounded-2xl border bg-dark-secondary p-4 mb-4">
            <Text className="text-base text-white font-semibold mb-3">{title}</Text>

            {/* Conteneur du graphe */}
            <View
                className="px-1"
                style={{ height: chartH, position: "relative", overflow: "visible" }}
                onLayout={onChartLayout}
            >
                {/* LAYER 1: barres + labels (flex-row) */}
                <View className="absolute left-0 right-0 bottom-0 flex-row items-end justify-between">
                    {values.map((v, i) => {
                        const mins  = toMinutes(v);
                        const ratio = Math.max(0, Math.min(1, mins / maxMinutes));
                        const barH  = Math.max(BAR_MIN_H, ratio * height);

                        return (
                            <View
                                key={i}
                                className="items-center"
                                style={{
                                    width: slotW || 20, // fallback < 1st render
                                    height: chartH,
                                    justifyContent: "flex-end",
                                }}
                            >
                                {/* Barre (press & hold) */}
                                <Pressable
                                    onPressIn={() => setActiveIndex(i)}
                                    onPressOut={() => setActiveIndex(null)}
                                    className="rounded-t-md bg-violet-500"
                                    style={{ width: barW, height: barH, zIndex: 1 }}
                                />
                                {/* Label pressable */}
                                {labels?.[i] ? (
                                    <Pressable
                                        onPressIn={() => setActiveIndex(i)}
                                        onPressOut={() => setActiveIndex(null)}
                                    >
                                        <Text className="text-[12px] text-white mt-1">{labels[i]}</Text>
                                    </Pressable>
                                ) : null}
                            </View>
                        );
                    })}
                </View>

                {/* LAYER 2: tooltip absolu au-dessus du graphe (pas dans la colonne) */}
                {tooltipInfo && (
                    <View
                        style={{
                            position: "absolute",
                            bottom: tooltipInfo.bottom,
                            left: tooltipInfo.left,
                            width: 64,                 // largeur fixe → pas de wrap vertical
                            zIndex: 10,
                            elevation: 10,             // Android
                            pointerEvents: "none",
                            alignItems: "center",
                        }}
                    >
                        <View
                            style={{
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                                borderRadius: 10,
                                backgroundColor: "#111827",
                            }}
                        >
                            <Text className="text-[11px] text-white" numberOfLines={1}>
                                {tooltipInfo.text}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}