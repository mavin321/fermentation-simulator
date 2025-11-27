#include "fermentation_model.h"
#include "rk4_solver.h"
#include <math.h>
#include <string.h>

typedef struct {
    KineticParams params;
    OperatingConditions ops;
} ModelContext;

static void fermentation_ode_wrapper(
    double t,
    const double *state,
    double *dstate_dt,
    void *user_data
) {
    (void)t; // unused
    ModelContext *ctx = (ModelContext *)user_data;
    fermentation_odes(t, state, dstate_dt, &ctx->params, &ctx->ops);
}

void fermentation_odes(
    double t,
    const double *state,
    double *dstate_dt,
    const KineticParams *params,
    const OperatingConditions *ops
) {
    (void)t;

    double X  = state[0];
    double S  = state[1];
    double P  = state[2];
    double DO = state[3];
    double T  = state[4];
    // Avoid division by zero
double DO_safe = fmax(DO, 1e-8);
double S_safe = fmax(S, 1e-8);

    double mu_monod = params->mu_max * S_safe / (params->Ks + S_safe);

    double o2_factor = DO_safe / (params->Kio + DO_safe);

    double mu = mu_monod * o2_factor;

    double rX = (mu - params->kd) * X;
    double rS = -(1.0 / params->Yxs) * mu * X;
    double rP = params->Ypx * mu * X;

    // Oxygen uptake rate
    double OUR = params->O2_maintenance * X;
    double Kla = params->Kla;
    double C_star = params->C_star;
    double OTR = Kla * (C_star - DO);

    // Simplified empirical adjustment for aeration/agitation
    double kla_factor = 1.0 + 0.3 * (ops->aeration_rate - 1.0) + 0.001 * (ops->agitation_speed - 300.0);
    if (kla_factor < 0.1) kla_factor = 0.1;
    OTR *= kla_factor;

    double dXdt  = rX;
    double dSdt  = rS;
    double dPdt  = rP;
    double dDOdt = OTR - OUR;

    // Heat balance (simplified)
    double Q_gen = params->delta_H * mu * X * ops->volume;
    double Q_loss = params->U * params->A * (T - ops->cooling_temp);
    double dTdt = (Q_gen - Q_loss) / (params->rho * ops->volume * params->Cp);

    dstate_dt[0] = dXdt;
    dstate_dt[1] = dSdt;
    dstate_dt[2] = dPdt;
    dstate_dt[3] = dDOdt;
    dstate_dt[4] = dTdt;
}

int integrate_fermentation_rk4(
    const double *time_points,
    size_t n_points,
    const double *y0,
    double *y_out,
    const KineticParams *params,
    const OperatingConditions *ops
) {
    ModelContext ctx;
    memcpy(&ctx.params, params, sizeof(KineticParams));
    memcpy(&ctx.ops, ops, sizeof(OperatingConditions));

    size_t state_dim = 5;

    return rk4_integrate(
        fermentation_ode_wrapper,
        (void *)&ctx,
        time_points,
        n_points,
        y0,
        state_dim,
        y_out
    );
}
