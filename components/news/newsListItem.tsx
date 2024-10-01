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
import React from "react";

const SwipeAction = ({ dragX, text, type = "left", onClick }: any) => {
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
                onPress={onClick}
            >
                <Animated.Text>{text}</Animated.Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const renderLeftActions = (
    _progress: any,
    translation: SharedValue<number>,
    item: ArticleType,
    onClick: () => void
) => <SwipeAction dragX={translation} text="Delete" onClick={onClick} />;

const renderRightActions = (
    _progress: any,
    translation: SharedValue<number>,
    item: ArticleType,
    onClick: () => void
) => (
    <SwipeAction
        dragX={translation}
        text={item?.isPinned == 0 ? "Pin" : "Un Pin"}
        type="right"
        onClick={onClick}
    />
);

interface NewsListItemInterface {
    item: ArticleType;
    onPinPress: (item: ArticleType) => void;
    onDeletePress: (item: ArticleType) => void;
}

const NewsListItem: React.FunctionComponent<NewsListItemInterface> = ({
    item,
    onPinPress,
    onDeletePress,
}) => {
    const swipeRef = useRef(null);
    console.log("re rendered item", item?.id);

    const onLeftClick = () => {
        onDeletePress(item);
        swipeRef?.current?.close();
    };

    const onRightClick = () => {
        onPinPress(item);
        swipeRef?.current?.close();
    };

    return (
        <Swipeable
            ref={swipeRef}
            renderLeftActions={(_, progress) =>
                renderLeftActions(_, progress, item, onLeftClick)
            }
            renderRightActions={(_, progress) =>
                renderRightActions(_, progress, item, onRightClick)
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
                    <ThemedText
                        style={styles.subtle_text}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
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

export default React.memo(
    NewsListItem,
    (prev, next) =>
        prev?.item?.id == next?.item?.id &&
        prev?.item?.isPinned == next?.item?.isPinned
);
