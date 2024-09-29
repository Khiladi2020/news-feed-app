import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { EvilIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ArticleType } from "../types/news";
import dbService, { DBService, dbServiceInstance } from "../services/dbService";

const data = [{}];
// curl --location --request POST 'https://asia-south1-kc-stage-rp.cloudfunctions.net/globalNews?endpoint=everything&q=tesla&from=2024-07-27&sortBy=publishedAt' \
// --header 'Accept: application/json, text/plain, */*' \
// --data ''

const API_URL = `https://newsapi.org/v2/everything?q=india&from=2024-08-29&sortBy=publishedAt&page=1&pageSize=100&apiKey=${process.env.EXPO_PUBLIC_NEWS_API_KEY}`;

function getFormattedDate(dateString: string) {
    const date = new Date(dateString);

    // Extract hours, minutes, and seconds
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const ampm = hours >= 12 ? "PM" : "AM";

    // Format the time (adding leading zeros if necessary)
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")} ${ampm}`;

    return formattedTime;
}

export default function NewsScreen() {
    const sWidth = Dimensions.get("window").width;
    const [listData, setListData] = useState<Array<ArticleType>>([]);

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

        const displayData = await dbServiceInstance.getAllNews();
        setListData(displayData);
    };

    useEffect(() => {
        console.log("API", API_URL);
        fetchData();
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

    return (
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
                            <View style={styles.news_item}>
                                <View style={styles.news_item_left}>
                                    <ThemedText style={styles.subtle_text}>
                                        {item.source.name}
                                    </ThemedText>
                                    <ThemedText
                                        style={styles.news_item_title}
                                        numberOfLines={3}
                                        ellipsizeMode="tail"
                                    >
                                        {item.title}
                                    </ThemedText>
                                    <ThemedText style={styles.subtle_text}>
                                        {item.author}
                                    </ThemedText>
                                </View>
                                <View style={styles.news_item_right}>
                                    <ThemedText style={styles.subtle_text_dark}>
                                        {getFormattedDate(item.publishedAt)}
                                    </ThemedText>
                                    <Image
                                        source={{ uri: item.urlToImage }}
                                        style={styles.news_item_image}
                                    />
                                </View>
                            </View>
                        );
                    }}
                    ItemSeparatorComponent={<View style={styles.seperator} />}
                />
            </ThemedView>
        </SafeAreaView>
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
