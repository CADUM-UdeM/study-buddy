import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, ImageSourcePropType, View } from "react-native";

const SHEET_W = 1536;
const SHEET_H = 1024;

const WALKING_SHEET = require("../../assets/images/Purple_bird_walking_animation_frames.png");
/** Single clean frame for settings (no sprite-sheet bleed) */
const CHIBI_PARAMETRES = require("../../assets/images/chibi_bird_singing_parametres.png");

/** Alpha-tight crops (global sheet coords) */
const WALK_FRAMES = [
  { sx: 175, sy: 285, sw: 332, sh: 399 },
  { sx: 615, sy: 285, sw: 316, sh: 400 },
  { sx: 1099, sy: 285, sw: 296, sh: 399 },
];
const WALK_MAX_W = 332;
const WALK_MAX_H = 400;
const WALK_SEQUENCE = [0, 1, 2, 1];

const CHIBI_SINGLE_W = 615;
const CHIBI_SINGLE_H = 631;

type RegionSpriteProps = {
  source: ImageSourcePropType;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  width: number;
  height: number;
};

function RegionSprite({ source, sx, sy, sw, sh, width, height }: RegionSpriteProps) {
  const scaleX = width / sw;
  const scaleY = height / sh;
  const imgW = SHEET_W * scaleX;
  const imgH = SHEET_H * scaleY;

  return (
    <View style={{ width, height, overflow: "hidden" }} pointerEvents="none">
      <Image
        source={source}
        style={{
          position: "absolute",
          width: imgW,
          height: imgH,
          left: -sx * scaleX,
          top: -sy * scaleY,
        }}
        resizeMode="stretch"
      />
    </View>
  );
}

type FrameBoxProps = {
  source: ImageSourcePropType;
  frame: { sx: number; sy: number; sw: number; sh: number };
  maxSourceW: number;
  maxSourceH: number;
  displayHeight: number;
};

/** Fixed box (max frame size), each pose bottom-aligned & horizontally centered */
function FramedSprite({ source, frame, maxSourceW, maxSourceH, displayHeight }: FrameBoxProps) {
  const scale = displayHeight / maxSourceH;
  const boxW = maxSourceW * scale;
  const boxH = displayHeight;
  const w = frame.sw * scale;
  const h = frame.sh * scale;

  return (
    <View
      style={{
        width: boxW,
        height: boxH,
        justifyContent: "flex-end",
        alignItems: "center",
      }}
      pointerEvents="none"
    >
      <RegionSprite
        source={source}
        sx={frame.sx}
        sy={frame.sy}
        sw={frame.sw}
        sh={frame.sh}
        width={w}
        height={h}
      />
    </View>
  );
}

type PeekProps = {
  displayHeight?: number;
  /** Pixels of sprite that sit above the card top (hangs / peeks) */
  overlap?: number;
  right?: number;
};

/**
 * Absolute overlay: put as last child inside a `position: 'relative'` wrapper
 * around the card / tracker so it draws on top and peeks above the top edge.
 */
export function WalkingBirdPeek({
  displayHeight = 80,
  overlap = 40,
  right = 4,
}: PeekProps) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % WALK_SEQUENCE.length), 175);
    return () => clearInterval(t);
  }, []);
  const frame = WALK_FRAMES[WALK_SEQUENCE[i]];

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        right,
        zIndex: 10,
        transform: [{ translateY: -overlap }],
      }}
    >
      <FramedSprite
        source={WALKING_SHEET}
        frame={frame}
        maxSourceW={WALK_MAX_W}
        maxSourceH={WALK_MAX_H}
        displayHeight={displayHeight}
      />
    </View>
  );
}

export function ChibiBirdPeek({
  displayHeight = 72,
  overlap = 34,
  right = 6,
}: PeekProps) {
  const w = displayHeight * (CHIBI_SINGLE_W / CHIBI_SINGLE_H);
  const sing = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sing, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sing, {
          toValue: 0,
          duration: 400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [sing]);

  const bobY = sing.interpolate({ inputRange: [0, 1], outputRange: [0, -2.5] });

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        right,
        zIndex: 10,
        transform: [{ translateY: -overlap }],
      }}
    >
      <Animated.View
        style={{
          width: w,
          height: displayHeight,
          transform: [{ translateY: bobY }],
        }}
      >
        <Image
          source={CHIBI_PARAMETRES}
          style={{ width: w, height: displayHeight }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}
