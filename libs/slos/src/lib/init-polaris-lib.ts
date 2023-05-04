import { PolarisRuntime } from '@polaris-sloc/core';
import { K8ssandraEfficiencyMetricMapping } from './metrics/k8ssandra-efficiency-metric.prm';
import { K8ssandraEfficiencySloMapping } from './slo-mappings/k8ssandra-efficiency.slo-mapping.prm';

/**
 * Initializes this library and registers its types with the transformer in the `PolarisRuntime`.
 */
export function initPolarisLib(polarisRuntime: PolarisRuntime): void {
  polarisRuntime.transformer.registerObjectKind(
    new K8ssandraEfficiencyMetricMapping().objectKind,
    K8ssandraEfficiencyMetricMapping
  );

  polarisRuntime.transformer.registerObjectKind(
    new K8ssandraEfficiencySloMapping().objectKind,
    K8ssandraEfficiencySloMapping
  );
}
