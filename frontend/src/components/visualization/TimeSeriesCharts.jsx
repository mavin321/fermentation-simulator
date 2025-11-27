import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import { Box, Card, CardContent, Typography } from "@mui/material";

function TimeSeriesCharts({ result }) {
  if (!result) {
    return null;
  }

  const { time, states } = result;
  const data = time.map((t, i) => ({
    t,
    X: states.X[i],
    S: states.S[i],
    P: states.P[i],
    DO: states.DO[i],
    T: states.T[i]
  }));

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle1" gutterBottom>
          Time Series
        </Typography>
        <Box sx={{ flex: 1, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="t" label={{ value: "Time (h)", position: "insideBottomRight", offset: -5 }} />
              <YAxis yAxisId={0} label={{ value: "Concentration (g/L)", angle: -90, position: "insideLeft" }} />
              <YAxis
                yAxisId={1}
                orientation="right"
                label={{ value: "Temperature (°C)", angle: 90, position: "insideRight" }}
              />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="X" stroke="#00e676" dot={false} yAxisId={0} />
              <Line type="monotone" dataKey="S" stroke="#ffeb3b" dot={false} yAxisId={0} />
              <Line type="monotone" dataKey="P" stroke="#ff9800" dot={false} yAxisId={0} />
              <Line type="monotone" dataKey="DO" stroke="#2196f3" dot={false} yAxisId={0} />
              <Line type="monotone" dataKey="T" stroke="#f44336" dot={false} yAxisId={1} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

export default TimeSeriesCharts;
