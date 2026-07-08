import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import IonIcons from "@expo/vector-icons/Ionicons";

const PAGES = [
    { id: 'index', iconName: 'home' as const },
    { id: 'donnees', iconName: 'stats-chart' as const },
    { id: 'pomodoro', iconName: 'alarm' as const },
    { id: 'parametres', iconName: 'settings' as const },
];

interface NavSegmentedProps {
    dark: boolean;
    currentActive: string;
    onTabPress: (id: string) => void;
    theme: any;
}

export function NavBar({ dark, currentActive, onTabPress, theme }: NavSegmentedProps) {
    return (
        <View style={[styles.nav, { backgroundColor: theme.navBarBgColor,
        }]}>
            {PAGES.map(({ id, iconName }) => {
                const isActive = currentActive === id;
                const iconColor = isActive ? theme.activeColorIcon : theme.inactiveColorIcon;

                return (
                    <Pressable
                        key={id}
                        onPress={() => onTabPress(id)}
                        style={styles.button}
                    >
                        {isActive && (
                            <MotiView
                                from={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', damping: 20, mass: 0.5 }}
                                style={[
                                    StyleSheet.absoluteFillObject,
                                    styles.indicator,
                                    {
                                        backgroundColor: theme.mainWrapperBgColor,
                                        shadowColor: dark ? '#000' : theme.activeColorIcon,
                                    }
                                ]}
                            />
                        )}

                        {/* Animation seulement sur une icône active */}
                        <MotiView
                            animate={{ scale: isActive ? 1.15 : 1 }}
                            transition={
                                isActive
                                    ? { type: 'spring', damping: 18, mass: 0.6 }
                                    : { type: 'timing', duration: 0 }
                            }
                        >
                            <IonIcons name={iconName} size={22} color={iconColor} />

                        </MotiView>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    nav: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 6,
        borderRadius:30,
        paddingBottom:40,
        height: 100,
    },

    button: {
        flex: 1,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    indicator: {
        borderRadius: 14,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
});