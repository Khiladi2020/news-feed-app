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
    };

    const startRefreshTimers = () => {
        const id = setInterval(() => {
            console.log("Refresh request received");

            dbServiceInstance
                .getBatchedNews(offset.current, PAGE_SIZE)
                .then((data) => {
                    console.log(
                        "data refreshed",
                        data.map((dd) => dd?.id)
                    );
                    offset.current += PAGE_SIZE;
                    setListData(data);
                });
        }, 5000); // change to 10 sec for now 5 secs

        return id;
    };

    useEffect(() => {
        console.log("API", API_URL);
        fetchData();
        const timerId = startRefreshTimers();

        return () => clearInterval(timerId);
    }, []);

    const onRefreshPress = () => {
        dbServiceInstance.deleteAllData();
        dbServiceInstance.ifAnyNewsItemExists().then((data) => {
            console.log("bba", data);
        });
        // dbServiceInstance.getAllNews().then((data) => {
        //     console.log("All news data", data);
        // });
        // dbServiceInstance.deleteTable();
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
                            return <NewsListItem item={item} />;
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
