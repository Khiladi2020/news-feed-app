import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { EvilIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ArticleType } from "../types/news";
import dbService, { DBService, dbServiceInstance } from "../services/dbService";
import {
    GestureHandlerRootView,
    RectButton,
    Swipeable,
} from "react-native-gesture-handler";
import Animated, {
    Extrapolation,
    interpolate,
    SharedValue,
    useAnimatedStyle,
} from "react-native-reanimated";
import NewsListItem from "../components/news/newsListItem";

const data = [{}];
// curl --location --request POST 'https://asia-south1-kc-stage-rp.cloudfunctions.net/globalNews?endpoint=everything&q=tesla&from=2024-07-27&sortBy=publishedAt' \
// --header 'Accept: application/json, text/plain, */*' \
// --data ''

const todayMonth = new Date().getMonth().toString().padStart(2, "0");
const API_URL = `https://newsapi.org/v2/everything?q=india&from=2024-${todayMonth}-01&sortBy=publishedAt&page=1&pageSize=100&apiKey=${process.env.EXPO_PUBLIC_NEWS_API_KEY}`;

export default function NewsScreen() {
    const sWidth = Dimensions.get("window").width;
    const [listData, setListData] = useState<Array<ArticleType>>([]);

    const [isLoading, setIsLoading] = useState(true);
    const timerId = useRef<NodeJS.Timeout | null>(null);

    const offset = useRef(0);
    const PAGE_SIZE = 5;

    const fetchFromNetowrk = async (): Promise<Array<ArticleType>> => {
        try {
            const raw = await fetch(API_URL);
            const data = await raw.json();
            return data?.articles;
        } catch (err) {
            Alert.alert("Network error occured");
            return [];
        }
    };

    const fetchData = async () => {
        setIsLoading(true);

        const isLocalDataAvailable =
            await dbServiceInstance.ifAnyNewsItemExists();
        if (!isLocalDataAvailable) {
            console.log("Actual netowrk request made");
            const data = await fetchFromNetowrk();
            // save in DB
            dbServiceInstance.insertBulkNews(data);
        } else {
            console.log("Serving data from local db");
        }

        const displayData = await dbServiceInstance.getBatchedNews(
            offset.current,
            PAGE_SIZE
        );
        offset.current += PAGE_SIZE;

        setListData(displayData);
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        if (displayData.length > 0) return true;
        else return false;
    };

    const fetchNextBatchOfData = () => {
        dbServiceInstance
            .getBatchedNews(offset.current, PAGE_SIZE)
            .then((data) => {
                console.log(
                    "data refreshed",
                    data.map((dd) => dd?.id)
                );
                if (data.length == 0) {
                    resetApp();
                }
                offset.current += PAGE_SIZE;
                // Add current data in front of prev data
                // then put all pinned items in front
                setListData((prev) => {
                    const combinedData = data.concat(prev);
                    const pinnedItems = combinedData.filter(
                        (val) => val.isPinned == 1
                    );
                    console.log("Pinned items", pinnedItems);
                    const nonPinnedItems = combinedData.filter(
                        (val) => val.isPinned == 0
                    );
                    return [...pinnedItems, ...nonPinnedItems];
                });
            });
    };

    const startRefreshTimers = () => {
        timerId.current = setInterval(() => {
            console.log("Refresh request received");
            fetchNextBatchOfData();
        }, 5000); // change to 10 sec for now 5 secs
    };

    const startApp = async () => {
        const isThereAnyData = await fetchData();
        console.log("is there any data", isThereAnyData);
        if (isThereAnyData) startRefreshTimers();
    };

    const resetApp = async () => {
        console.log("[Reset App Data] No data. Clearing Timer");
        clearInterval(timerId.current ?? undefined);
        // Reset offset
        offset.current = 0;
        await dbServiceInstance.deleteAllData();
    };

    useEffect(() => {
        console.log("API", API_URL);
        startApp();

        return () => clearInterval(timerId.current ?? undefined);
    }, []);

    const onRefreshPress = () => {
        // If any data present in DB than start the timers
        // otherwise fetch new data
        dbServiceInstance.ifAnyNewsItemExists().then((exists) => {
            // If Exists
            if (exists) {
                console.log("Data Existing Already, start to display those");
                fetchNextBatchOfData();
            } else {
                console.log("Re starting the app data");
                startApp();
            }
        });
    };

    const onPinPress = (id: number, pinVal: 0 | 1) => {
        console.log("pressed the pin", id, pinVal);

        setListData((prev) => {
            // switch pinned value here
            const clonedData = prev.map((val) =>
                val.id === id
                    ? { ...val, isPinned: (pinVal == 1 ? 0 : 1) as 0 | 1 }
                    : val
            );
            const pinnedItems = clonedData.filter((val) => val.isPinned == 1);
            // console.log("Pinned items", pinnedItems);
            const nonPinnedItems = clonedData.filter(
                (val) => val.isPinned == 0
            );
            return [...pinnedItems, ...nonPinnedItems];
        });
    };
    // console.log("re-render API data", apiData);

    if (isLoading) {
        return (
            <ThemedView
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ActivityIndicator size={"large"} />
            </ThemedView>
        );
    }

    return (
        <GestureHandlerRootView>
            <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
                <ThemedView style={styles.header}>
                    <Image
                        source={require("../assets/images/company_logo.png")}
                        resizeMode="cover"
                        style={styles.header_image}
                    />
                    <TouchableOpacity onPress={onRefreshPress}>
                        <EvilIcons name="refresh" size={40} />
                    </TouchableOpacity>
                </ThemedView>
                <ThemedView>
                    <FlatList
                        data={listData}
                        keyExtractor={(item) => item.url}
                        renderItem={({ item }) => {
                            return (
                                <NewsListItem
                                    item={item}
                                    onPinPress={onPinPress}
                                />
                            );
                        }}
                        ItemSeparatorComponent={
                            <View style={styles.seperator} />
                        }
                    />
                </ThemedView>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
    },
    header_image: {
        height: 50,
        width: 110,
    },
    news_item: {
        flexDirection: "row",
        padding: 16,
    },
    news_item_title: {
        fontSize: 24,
        fontWeight: "600",
    },
    news_item_left: {
        flexDirection: "column",
        flex: 1,
        gap: 18,
    },
    news_item_right: {
        flexDirection: "column",
        marginLeft: 8,
        justifyContent: "space-around",
    },
    news_item_image: {
        height: 64,
        width: 64,
        borderRadius: 12,
        overflow: "hidden",
    },
    subtle_text: {
        color: "#808080",
    },

    subtle_text_dark: {
        color: "#404040",
    },
    seperator: {
        height: 1,
        backgroundColor: "gray",
    },
});
