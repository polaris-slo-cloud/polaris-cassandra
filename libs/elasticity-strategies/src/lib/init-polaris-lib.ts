import { PolarisRuntime } from '@polaris-sloc/core';
import { K8ssandraElasticityStrategy } from './elasticity/k8ssandra-elasticity-strategy.prm';

/**
 * Initializes this library and registers its types with the transformer in the `PolarisRuntime`.
 */
export function initPolarisLib(polarisRuntime: PolarisRuntime): void {
  polarisRuntime.transformer.registerObjectKind(
    new K8ssandraElasticityStrategy().objectKind,
    K8ssandraElasticityStrategy
  );
}
