import { PolarisRuntime } from '@polaris-sloc/core';
import { EfficiencyMetricMapping } from './metrics/efficiency-metric.prm';

/**
 * Initializes this library and registers its types with the transformer in the `PolarisRuntime`.
 */
export function initPolarisLib(polarisRuntime: PolarisRuntime): void {
  polarisRuntime.transformer.registerObjectKind(
    new EfficiencyMetricMapping().objectKind,
    EfficiencyMetricMapping
  );
}
