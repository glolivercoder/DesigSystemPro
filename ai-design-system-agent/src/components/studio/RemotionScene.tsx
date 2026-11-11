"use client";

import type { CSSProperties } from "react";
import { Player } from "@remotion/player";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { MotionScene } from "@/lib/types";

const SceneLayer = ({ scene }: { scene: MotionScene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 24 });
  const exit = interpolate(frame, [scene.duration * fps - 18, scene.duration * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.max(0, Math.min(enter, exit));
  const translate = interpolate(enter, [0, 1], [scene.transition === "slide" ? 90 : 0, 0]);
  const scale = scene.transition === "scale" ? interpolate(enter, [0, 1], [1.1, 1]) : 1;
  const clip = scene.transition === "wipe" ? `inset(0 ${interpolate(enter, [0, 1], [100, 0])}% 0 0)` : undefined;

  const fill: CSSProperties = {
    background: scene.bg,
    color: scene.accent,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "9% 10%",
    gap: 22,
    opacity,
    transform: `translateY(${translate}px) scale(${scale})`,
    clipPath: clip,
  };

  return (
    <AbsoluteFill style={fill}>
      <span style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.3em", fontSize: 16, opacity: 0.68 }}>
        {scene.label.toUpperCase()}
      </span>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 88, lineHeight: 0.98, margin: 0, maxWidth: "86%", letterSpacing: "-0.03em" }}>
        {scene.title}
      </h1>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 24, opacity: 0.72, maxWidth: "68%", lineHeight: 1.5, margin: 0 }}>
        {scene.subtitle}
      </p>
      <div
        style={{
          position: "absolute",
          right: "8%",
          bottom: "10%",
          width: 170,
          height: 170,
          borderRadius: 999,
          border: `1px solid ${scene.accent}`,
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "12%",
          bottom: "16%",
          width: 70,
          height: 70,
          borderRadius: 999,
          background: scene.accent,
          opacity: 0.24,
        }}
      />
    </AbsoluteFill>
  );
};

const Composition = ({ scenes }: { scenes: MotionScene[] }) => {
  let cursor = 0;
  return (
    <AbsoluteFill style={{ background: "#050607" }}>
      {scenes.map((scene) => {
        const from = cursor;
        const durationInFrames = Math.max(12, Math.round(scene.duration * 30));
        cursor += durationInFrames;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
            <SceneLayer scene={scene} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export default function RemotionScene({ scenes, fps = 30 }: { scenes: MotionScene[]; fps?: number }) {
  const total = Math.max(60, Math.round(scenes.reduce((acc, scene) => acc + scene.duration, 0) * fps));
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Player
        component={Composition}
        inputProps={{ scenes }}
        durationInFrames={total}
        compositionWidth={1280}
        compositionHeight={720}
        fps={fps}
        controls
        loop
        style={{ width: "100%", borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
        <span className="hint" style={{ fontSize: 10 }}>
          Remotion Player · {scenes.length} cenas · {(total / fps).toFixed(1)}s @ {fps}fps
        </span>
        <span className="badge badge-accent">remotion preview</span>
      </div>
    </div>
  );
}
