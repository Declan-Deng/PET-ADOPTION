import * as React from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  ActivityIndicator,
  IconButton,
  Text,
  Button,
} from "react-native-paper";

const { width } = Dimensions.get("window");

const ImageCarousel = ({ images = [], onImagePress, style }) => {
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const [imageLoading, setImageLoading] = React.useState({});
  const [imageError, setImageError] = React.useState({});
  const [retryCount, setRetryCount] = React.useState({});
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [imagesLoaded, setImagesLoaded] = React.useState({});

  const MAX_RETRY_COUNT = 3;

  React.useEffect(() => {
    console.log("Images prop:", images);
  }, [images]);

  // 预加载图片
  React.useEffect(() => {
    if (images && images.length > 0) {
      console.log("开始预加载图片...");
      images.forEach((uri, index) => {
        console.log(`预加载图片 ${index}: ${uri}`);
        Image.prefetch(uri)
          .then(() => {
            console.log(`图片 ${index} 预加载成功`);
          })
          .catch((error) => {
            console.error(`图片 ${index} 预加载失败:`, error);
          });
      });
    }
  }, [images]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / width);
        setCurrentIndex(index);
      },
    }
  );

  const handleImageLoadStart = (index) => {
    if (!imagesLoaded[index]) {
      setImageLoading((prev) => ({ ...prev, [index]: true }));
    }
  };

  const handleImageLoadEnd = (index) => {
    setImagesLoaded((prev) => ({ ...prev, [index]: true }));
    setImageLoading((prev) => ({ ...prev, [index]: false }));
    setImageError((prev) => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index, error) => {
    console.error(`图片 ${index} 加载失败:`, error);
    console.error("图片URL:", images[index]);

    const currentRetryCount = retryCount[index] || 0;

    if (currentRetryCount < MAX_RETRY_COUNT) {
      console.log(
        `尝试重新加载图片 ${index}，第 ${currentRetryCount + 1} 次重试`
      );
      setRetryCount((prev) => ({ ...prev, [index]: currentRetryCount + 1 }));

      // 使用setTimeout来延迟重试
      setTimeout(() => {
        setImageLoading((prev) => ({ ...prev, [index]: true }));
        // 强制重新加载图片
        Image.prefetch(images[index])
          .then(() => {
            setImageLoading((prev) => ({ ...prev, [index]: false }));
          })
          .catch(() => {
            setImageLoading((prev) => ({ ...prev, [index]: false }));
            setImageError((prev) => ({ ...prev, [index]: true }));
          });
      }, 1000 * (currentRetryCount + 1)); // 递增重试延迟
    } else {
      console.log(`图片 ${index} 加载失败，已达到最大重试次数`);
      setImageLoading((prev) => ({ ...prev, [index]: false }));
      setImageError((prev) => ({ ...prev, [index]: true }));
    }
  };

  const handleRetry = (index) => {
    console.log(`手动重试加载图片 ${index}`);
    setRetryCount((prev) => ({ ...prev, [index]: 0 }));
    setImageError((prev) => ({ ...prev, [index]: false }));
    setImageLoading((prev) => ({ ...prev, [index]: true }));
  };

  const scrollToImage = (index) => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ x: index * width, animated: true });
    }
  };

  const carouselRef = React.useRef(null);

  if (!images || images.length === 0) {
    console.log("没有图片可显示");
    return (
      <View style={[styles.imageContainer, styles.noImageContainer]}>
        <Text>暂无图片</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Animated.ScrollView
        ref={carouselRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((uri, index) => (
          <TouchableOpacity
            key={`${uri}_${index}`}
            activeOpacity={0.9}
            onPress={() => onImagePress && onImagePress(index)}
            style={styles.imageContainer}
          >
            <Image
              source={{
                uri,
                cache: Platform.OS === "ios" ? "reload" : "default",
              }}
              style={styles.image}
              onLoadStart={() => handleImageLoadStart(index)}
              onLoadEnd={() => handleImageLoadEnd(index)}
              onError={() => handleImageError(index)}
              resizeMode="cover"
            />
            {imageLoading[index] &&
              !imagesLoaded[index] &&
              !imageError[index] && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1a237e" />
                  <Text style={styles.loadingText}>
                    {retryCount[index]
                      ? `重试加载中 (${retryCount[index]}/${MAX_RETRY_COUNT})`
                      : "加载中..."}
                  </Text>
                </View>
              )}
            {imageError[index] && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>图片加载失败</Text>
                <Button
                  mode="contained"
                  onPress={() => handleRetry(index)}
                  style={styles.retryButton}
                >
                  重试
                </Button>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>

      {images.length > 1 && (
        <>
          <View style={styles.pagination}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentIndex === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.navigationButtons}>
            <IconButton
              icon="chevron-left"
              size={24}
              iconColor="#fff"
              style={[styles.navButton, styles.navButtonLeft]}
              onPress={() => {
                const newIndex = Math.max(0, currentIndex - 1);
                scrollToImage(newIndex);
              }}
              disabled={currentIndex === 0}
            />
            <IconButton
              icon="chevron-right"
              size={24}
              iconColor="#fff"
              style={[styles.navButton, styles.navButtonRight]}
              onPress={() => {
                const newIndex = Math.min(images.length - 1, currentIndex + 1);
                scrollToImage(newIndex);
              }}
              disabled={currentIndex === images.length - 1}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  imageContainer: {
    width,
    height: width * 0.75,
    backgroundColor: "#f0f0f0",
  },
  noImageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  errorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  errorText: {
    color: "#f44336",
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#fff",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  navigationButtons: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    top: "50%",
    transform: [{ translateY: -20 }],
  },
  navButton: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    margin: 0,
  },
  navButtonLeft: {
    marginLeft: 8,
  },
  navButtonRight: {
    marginRight: 8,
  },
  retryButton: {
    marginTop: 8,
  },
  loadingText: {
    marginTop: 8,
    color: "#1a237e",
  },
  errorSubText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    marginBottom: 8,
  },
});

export default ImageCarousel;
