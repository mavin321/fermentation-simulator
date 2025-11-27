#ifndef FERMENTATION_MODEL_H
#define FERMENTATION_MODEL_H

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    double mu_max;
    double Ks;
    double Yxs;
    double Ypx;
    double kd;
    double Kio;    // oxygen inhibition
    double Kla;    // volumetric mass transfer coefficient
    double C_star; // saturation DO
    double O2_maintenance;
    double delta_H; // heat generation per biomass
    double Cp;      // heat capacity
    double U;       // overall heat transfer coefficient
    double A;       // heat transfer area
    double rho;
} KineticParams;

typedef struct {
    double volume;     // L
    double feed_rate;  // L/h
    double feed_substrate_conc; // g/L
    double aeration_rate;       // vvm
    double agitation_speed;     // rpm
    double cooling_temp;        // °C
    double coolant_flow;        // kg/s
} OperatingConditions;

/**
 * Computes derivatives for a state vector:
 * state[0] = X (biomass, g/L)
 * state[1] = S (substrate, g/L)
 * state[2] = P (product, g/L)
 * state[3] = DO (dissolved oxygen, g/L)
 * state[4] = T (temperature, °C)
 */
void fermentation_odes(
    double t,
    const double *state,
    double *dstate_dt,
    const KineticParams *params,
    const OperatingConditions *ops
);

/**
 * Generic fixed-step RK4 integrator for the fermentation model.
 * time_points – array of times (monotonic increasing)
 * n_points    – length of time_points
 * y0          – initial state (length 5)
 * y_out       – output (n_points x 5 flattened row-major)
 */
int integrate_fermentation_rk4(
    const double *time_points,
    size_t n_points,
    const double *y0,
    double *y_out,
    const KineticParams *params,
    const OperatingConditions *ops
);

#ifdef __cplusplus
}
#endif

#endif
