import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography
} from "@mui/material";
import ParameterForm from "./ParameterForm.jsx";

const defaultState = {
  X0: 1,
  S0: 20,
  P0: 0,
  DO0: 0.005,
  T0: 30,
  t_start: 0,
  t_end: 24,
  n_points: 241,
  mu_max: 0.4,
  Ks: 0.1,
  Yxs: 0.5,
  Ypx: 0.1,
  kd: 0.01,
  Kio: 0.0001,
  Kla: 200,
  C_star: 0.007,
  O2_maintenance: 0.0005,
  delta_H: 4e5,
  Cp: 4180,
  U: 500,
  A: 2,
  rho: 1000,
  volume: 5,
  feed_rate: 0,
  feed_substrate_conc: 500,
  aeration_rate: 1,
  agitation_speed: 300,
  cooling_temp: 25,
  coolant_flow: 1
};

function ControlPanel({ onRun }) {
  const [values, setValues] = useState(defaultState);
  const [mode, setMode] = useState("batch");

  const handleFieldChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onRun(values, mode);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        background:
          "linear-gradient(160deg, rgba(12, 18, 38, 0.95), rgba(12, 20, 46, 0.85))"
      }}
    >
      <CardContent>
        <Stack spacing={2.5}>
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ letterSpacing: 0.3 }}>
                Simulation Control
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Configure the run
              </Typography>
            </Box>
            <Chip
              label="Realtime"
              size="small"
              color="secondary"
              sx={{ bgcolor: "rgba(100,255,218,0.12)", border: "1px solid rgba(100,255,218,0.3)" }}
              variant="outlined"
            />
          </Box>

          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Mode</InputLabel>
              <Select
                label="Mode"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <MenuItem value="batch">Batch</MenuItem>
                <MenuItem value="fed_batch">Fed-batch (stub)</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              size="medium"
              onClick={handleSubmit}
              sx={{
                px: 2.8,
                py: 1,
                borderRadius: 2,
                boxShadow: "0 10px 30px rgba(77, 217, 247, 0.4)",
                background: "linear-gradient(135deg, #4dd9f7, #64ffda)"
              }}
            >
              Run Simulation
            </Button>
          </Box>

          <ParameterForm values={values} onChange={handleFieldChange} />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default ControlPanel;
