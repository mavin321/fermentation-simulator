import React, { useEffect, useState } from "react";
import { Grid, Snackbar, Alert, Slider } from "@mui/material";
import ControlPanel from "../components/controls/ControlPanel.jsx";
import TimeSeriesCharts from "../components/visualization/TimeSeriesCharts.jsx";
import FermenterAnimation from "../components/visualization/FermenterAnimation.jsx";
import { useSimulation } from "../hooks/useSimulation.js";

function Dashboard() {
  const { loading, error, result, simulate } = useSimulation();
  const [frameIndex, setFrameIndex] = useState(0);

  const handleRun = async (payload, mode) => {
    const res = await simulate(payload, mode);
    setFrameIndex(0);
    return res;
  };

  useEffect(() => {
    if (!result) return;
    // simple animation: increase frameIndex over time
    const id = setInterval(() => {
      setFrameIndex((prev) => {
        const max = result.time.length - 1;
        return prev >= max ? max : prev + 1;
      });
    }, 200);
    return () => clearInterval(id);
  }, [result]);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <ControlPanel onRun={handleRun} />
        </Grid>
        <Grid item xs={12} md={4}>
          <FermenterAnimation result={result} frameIndex={frameIndex} />
          {result && (
            <Slider
              size="small"
              sx={{ mt: 2 }}
              min={0}
              max={result.time.length - 1}
              value={frameIndex}
              onChange={(_, value) => setFrameIndex(value)}
            />
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <TimeSeriesCharts result={result} />
        </Grid>
      </Grid>

      <Snackbar open={!!error} autoHideDuration={6000}>
        <Alert severity="error" variant="filled">
          {String(error)}
        </Alert>
      </Snackbar>

      {loading && (
        <Snackbar open={true}>
          <Alert severity="info" variant="filled">
            Running simulation...
          </Alert>
        </Snackbar>
      )}
    </>
  );
}

export default Dashboard;
