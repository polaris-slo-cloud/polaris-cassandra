import { PolarisRuntime } from '@polaris-sloc/core';
import { K8ssandraEfficiencyMetricMapping } from './metrics/k8ssandra-efficiency-metric.prm';
import { K8ssandraEfficiencySloMapping } from './slo-mappings/k8ssandra-efficiency.slo-mapping.prm';
import { K8ssandraAvgWriteLoadSloMapping } from './slo-mappings/k8ssandra-avg-write-load.slo-mapping.prm';
import { K8ssandraVerticalEfficiencySloMapping } from './slo-mappings/k8ssandra-vertical-efficiency.slo-mapping.prm';

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
  polarisRuntime.transformer.registerObjectKind(
    new K8ssandraAvgWriteLoadSloMapping().objectKind,
    K8ssandraAvgWriteLoadSloMapping
  );
  polarisRuntime.transformer.registerObjectKind(
    new K8ssandraVerticalEfficiencySloMapping().objectKind,
    K8ssandraVerticalEfficiencySloMapping
  );
}
