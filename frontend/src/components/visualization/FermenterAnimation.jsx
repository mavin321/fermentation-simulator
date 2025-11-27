import React, { useMemo } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { motion } from "framer-motion";

/**
 * Props:
 *   result: simulation result
 *   frameIndex: index in the time array to visualize
 */
function FermenterAnimation({ result, frameIndex }) {
  if (!result) return null;

  const { states } = result;
  const idx = Math.min(frameIndex, states.X.length - 1);

  const X = states.X[idx];
  const DO = states.DO[idx];
  const T = states.T[idx];

  const { fillHeight, bubbleCount, liquidColor, glow } = useMemo(() => {
    const maxX = Math.max(...states.X);
    const maxDO = Math.max(...states.DO);

    const fillHeight = 30 + (X / (maxX || 1)) * 60; // 30–90%
    const bubbleCount = 5 + Math.round((DO / (maxDO || 1)) * 20);
    const liquidColor = DO < 0.001 ? "#ff7043" : "#26c6da";
    const glow = T > 35 ? "0 0 20px rgba(255, 82, 82, 0.8)" : "0 0 10px rgba(38, 198, 218, 0.7)";

    return { fillHeight, bubbleCount, liquidColor, glow };
  }, [states.X, states.DO, frameIndex]);

  const bubbles = Array.from({ length: bubbleCount });

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Virtual Fermenter
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            sx={{
              position: "relative",
              width: 200,
              height: 260,
              borderRadius: 4,
              border: "2px solid #90a4ae",
              overflow: "hidden",
              background: "#263238",
              boxShadow: glow
            }}
          >
            {/* Liquid phase */}
            <motion.div
              animate={{ height: `${fillHeight}%` }}
              transition={{ type: "spring", stiffness: 40, damping: 12 }}
              style={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                background: `linear-gradient(to top, ${liquidColor}, #4dd0e1)`
              }}
            />

            {/* Bubbles */}
            {bubbles.map((_, i) => {
              const delay = (i % 5) * 0.3;
              const left = 30 + (i % 5) * 25;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: [0, 1, 0], y: [-10, -60] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5,
                    delay,
                    ease: "easeOut"
                  }}
                  style={{
                    position: "absolute",
                    bottom: 40,
                    left,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    border: "1px solid #e0f7fa",
                    background: "rgba(224,247,250,0.2)"
                  }}
                />
              );
            })}

            {/* Impeller */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transformOrigin: "center",
                width: 40,
                height: 40,
                marginLeft: -20,
                borderRadius: "50%",
                border: "2px solid #b0bec5"
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 30,
                  height: 2,
                  background: "#b0bec5",
                  transform: "translate(-50%, -50%)"
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 2,
                  height: 30,
                  background: "#b0bec5",
                  transform: "translate(-50%, -50%)"
                }}
              />
            </motion.div>
          </Box>

          {/* Numeric indicators */}
          <Box>
            <Typography variant="body2">
              Time: {result.time[idx].toFixed(2)} h
            </Typography>
            <Typography variant="body2">
              X: {X.toFixed(2)} g/L
            </Typography>
            <Typography variant="body2">
              S: {states.S[idx].toFixed(2)} g/L
            </Typography>
            <Typography variant="body2">
              DO: {DO.toExponential(2)} g/L
            </Typography>
            <Typography variant="body2">
              T: {T.toFixed(2)} °C
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default FermenterAnimation;
