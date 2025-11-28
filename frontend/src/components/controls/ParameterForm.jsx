import React from "react";
import {
  Box,
  Grid,
  TextField,
  Typography
} from "@mui/material";

const numericFields = [
  { name: "X0", label: "Biomass X0 (g/L)", defaultValue: 1 },
  { name: "S0", label: "Substrate S0 (g/L)", defaultValue: 20 },
  { name: "P0", label: "Product P0 (g/L)", defaultValue: 0 },
  { name: "DO0", label: "DO0 (g/L)", defaultValue: 0.005 },
  { name: "T0", label: "Temperature T0 (°C)", defaultValue: 30 },
  { name: "t_end", label: "Duration (h)", defaultValue: 24 },
  { name: "n_points", label: "Time points", defaultValue: 241 },
  { name: "mu_max", label: "µmax (1/h)", defaultValue: 0.4 },
  { name: "Ks", label: "Ks (g/L)", defaultValue: 0.1 },
  { name: "Yxs", label: "Yx/s", defaultValue: 0.5 },
  { name: "Ypx", label: "Yp/x", defaultValue: 0.1 },
  { name: "Kla", label: "kLa (1/h)", defaultValue: 200 },
  { name: "volume", label: "Volume (L)", defaultValue: 5 },
  { name: "aeration_rate", label: "Aeration (vvm)", defaultValue: 1 },
  { name: "agitation_speed", label: "Agitation (rpm)", defaultValue: 300 },
  { name: "cooling_temp", label: "Cooling temp (°C)", defaultValue: 25 }
];

function ParameterForm({ values, onChange }) {
  const handleChange = (name) => (event) => {
    const val = parseFloat(event.target.value);
    onChange(name, Number.isNaN(val) ? "" : val);
  };

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
          Process Parameters
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Guardrails for batch physics and biology
        </Typography>
      </Box>
      <Grid container spacing={1}>
        {numericFields.map((f) => (
          <Grid item xs={6} md={4} key={f.name}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label={f.label}
              value={values[f.name] ?? f.defaultValue}
              onChange={handleChange(f.name)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderRadius: 2,
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.08)"
                  },
                  "&:hover fieldset": {
                    borderColor: "#4dd9f7"
                  }
                }
              }}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}

export default ParameterForm;
