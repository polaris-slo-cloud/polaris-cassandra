import { PolarisRuntime } from '@polaris-sloc/core';
import { HorizontalVerticalElasticityStrategy } from './elasticity/horizontal-vertical-elasticity-strategy.prm';

/**
 * Initializes this library and registers its types with the transformer in the `PolarisRuntime`.
 */
export function initPolarisLib(polarisRuntime: PolarisRuntime): void {
  polarisRuntime.transformer.registerObjectKind(
    new HorizontalVerticalElasticityStrategy().objectKind,
    HorizontalVerticalElasticityStrategy
  );
}
