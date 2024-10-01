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
import { AntDesign } from "@expo/vector-icons";

const SwipeAction = ({
    dragX,
    text,
    type = "left",
    onDeleteClick,
    onPinClick,
}: any) => {
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
                backgroundColor: type === "left" ? "tomato" : "#4BBDFC",
                borderTopLeftRadius: 12,
                borderBottomLeftRadius: 12,
                justifyContent: "center",
                gap: 8,
                transform: [{ translateX: trans }],
            }}
        >
            <TouchableOpacity
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 8,
                    gap: 8,
                }}
                onPress={onDeleteClick}
            >
                <AntDesign name="delete" size={20} color={"white"} />
                <Animated.Text style={{ color: "white" }}>{text}</Animated.Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 8,
                    gap: 8,
                }}
                onPress={onPinClick}
            >
                <AntDesign name="pushpin" size={20} color={"white"} />
                <Animated.Text style={{ color: "white" }}>{text}</Animated.Text>
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
    onDeleteClick: () => void,
    onPinClick: () => void
) => (
    <SwipeAction
        dragX={translation}
        text={item?.isPinned == 0 ? "Pin" : "Un Pin"}
        type="right"
        onDeleteClick={onDeleteClick}
        onPinClick={onPinClick}
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

    const onDeleteClick = () => {
        onDeletePress(item);
        swipeRef?.current?.close();
    };

    const onPinClick = () => {
        onPinPress(item);
        swipeRef?.current?.close();
    };

    return (
        <Swipeable
            ref={swipeRef}
            // renderLeftActions={(_, progress) =>
            //     renderLeftActions(_, progress, item, onLeftClick)
            // }
            renderRightActions={(_, progress) =>
                renderRightActions(_, progress, item, onDeleteClick, onPinClick)
            }
        >
            <View style={styles.news_item}>
                <View style={styles.news_item_left}>
                    {item?.isPinned ? (
                        <View style={{ flexDirection: "row" }}>
                            <AntDesign
                                name="pushpin"
                                size={20}
                                color={styles.subtle_text.color}
                            />
                            <ThemedText style={styles.pinned_text}>
                                Pinned on top
                            </ThemedText>
                        </View>
                    ) : null}
                    <ThemedText style={styles.subtle_text}>
                        {item.source.toString()}
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
    pinned_text: {
        color: "#808080",
        fontSize: 13,
        marginLeft: 4,
    },
});

export default React.memo(
    NewsListItem,
    (prev, next) =>
        prev?.item?.id == next?.item?.id &&
        prev?.item?.isPinned == next?.item?.isPinned
);
