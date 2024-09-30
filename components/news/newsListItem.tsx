import {
    View,
    StyleSheet,
    Image,
    Animated,
    Dimensions,
    TouchableOpacity,
} from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";
import { ThemedText } from "../ThemedText";
import { getFormattedDate } from "../../utils";
import { ArticleType } from "../../types/news";
import {
    Extrapolation,
    interpolate,
    SharedValue,
    useAnimatedStyle,
} from "react-native-reanimated";
import { useRef } from "react";

const SwipeAction = ({ dragX, swipeableRef, text, type = "left" }: any) => {
    const windowWidth = Dimensions.get("window").width;
    const viewWidth = windowWidth * 0.2;

    let trans;

    if (type == "left") {
        trans = dragX.interpolate({
            inputRange: [0, 50, 100, 101],
            outputRange: [-viewWidth, 0, 0, 1],
        });
    } else {
        trans = dragX.interpolate({
            inputRange: [-100, -50, -1],
            outputRange: [0, 10, viewWidth],
        });
    }

    return (
        <Animated.View
            style={{
                width: viewWidth,
                backgroundColor: type === "left" ? "tomato" : "#0F9D58",
                transform: [{ translateX: trans }],
            }}
        >
            <TouchableOpacity
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
                onPress={() => swipeableRef.current!.close()}
            >
                <Animated.Text>{text}</Animated.Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const renderLeftActions = (
    _progress: any,
    translation: SharedValue<number>,
    swipeableRef: React.RefObject<any>
) => (
    <SwipeAction
        dragX={translation}
        swipeableRef={swipeableRef}
        text="Delete"
    />
);

const renderRightActions = (
    _progress: any,
    translation: SharedValue<number>,
    swipeableRef: React.RefObject<any>
) => (
    <SwipeAction
        dragX={translation}
        swipeableRef={swipeableRef}
        text="Pin"
        type="right"
    />
);

interface NewsListItemInterface {
    item: ArticleType;
}

const NewsListItem: React.FunctionComponent<NewsListItemInterface> = ({
    item,
}) => {
    const swipeRef = useRef(null);

    return (
        <Swipeable
            ref={swipeRef}
            renderLeftActions={(_, progress) =>
                renderLeftActions(_, progress, swipeRef)
            }
            renderRightActions={(_, progress) =>
                renderRightActions(_, progress, swipeRef)
            }
        >
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
                        source={{
                            uri: item.urlToImage,
                        }}
                        style={styles.news_item_image}
                    />
                </View>
            </View>
        </Swipeable>
    );
};

const styles = StyleSheet.create({
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
});

export default NewsListItem;
