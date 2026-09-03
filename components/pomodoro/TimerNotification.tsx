import * as Notifications from 'expo-notifications';
import {AndroidImportance, SchedulableTriggerInputTypes} from 'expo-notifications';

/* Notification */
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowList: false,
        shouldShowBanner: false,
    }),
});

{/* --- Audio quand en dehors de l'application --- */
}
export const initNotifications = async () => {
    const {status} = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return false;
    await Notifications.setNotificationChannelAsync('timer-urgent', {
        name: 'Alarme Pomodoro',
        importance: AndroidImportance.MAX,
    });
    return true;
};


/* Pour déclencher notif si changement état session pomodoro */
export const startNotif = async (sec: number,
                                 inBreakTime: boolean, isFinished: boolean, id: string) => {
    try {
        const notif = {
            content: {
                title: inBreakTime ? (isFinished ? "Pomodoro complété" : "Pause terminé") : "Focus terminé",
                body: "Temps écoulé",
                sound: true,
                channelId: "timer-urgent",
            },
            trigger: {
                type: SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: sec,
            },
            id: id,
        };
        await Notifications.scheduleNotificationAsync(notif as any);
    } catch (error) {
        console.error(`"Erreur d'arrêt de notification ${error}`, error);
    }
}

/* Stop le déclenchement de la notif fin session pomodoro */
export const stopNotif = async () => {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
        console.error(`"Erreur d'arrêt de notification ${error}`, error);
    }
}
export const  manageNotif = (timeLeft: number, remainingCycle:number, inBreakTime: boolean, isFinished: boolean, pomodoroDuration:number, breakDuration:number) : void => {
    stopNotif().catch(err => console.log(err));
    let cycleId = remainingCycle;
    let overtimeAdded = 0;
    while (cycleId > 0) {
        /* Cas special cycle en cours : */
        if (cycleId === remainingCycle) {
            overtimeAdded += timeLeft;

            /* Si en pause actuellement */
            if (inBreakTime)
                startNotif(timeLeft, true, cycleId === 1, `Break${cycleId}`).catch(console.log);
            /* Sinon, on doit génère notif d'étude et de pause*/
            else {
                startNotif(overtimeAdded, false, isFinished, `Focus${cycleId}`).catch(console.log);
                startNotif(overtimeAdded += breakDuration, true,
                    cycleId === 1, `Break${cycleId}`).catch(console.log);
            }
        }
        /* Sinon cas standard */
        else {
            startNotif(overtimeAdded += pomodoroDuration, false,
                isFinished, `Focus${cycleId}`).catch(console.log);
            startNotif(overtimeAdded += breakDuration,
                true, cycleId === 1, `Break${cycleId}`).catch(console.log);
        }
        cycleId -= 1;
    }
}

initNotifications().catch(err => console.log(err));