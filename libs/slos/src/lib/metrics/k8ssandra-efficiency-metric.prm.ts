import {
  ComposedMetricMapping,
  ComposedMetricMappingSpec,
  ComposedMetricParams,
  ComposedMetricType,
  POLARIS_API,
} from '@polaris-sloc/core';

/**
 * Represents the value of a K8ssandraEfficiency metric.
 */
export interface K8ssandraEfficiency {
  avgCpuUtilisation: number;

  avgMemoryUtilisation: number;

  avgWriteLoadPerNode: number;
}

/**
 * The parameters for retrieving the K8ssandraEfficiency metric.
 */
export interface K8ssandraEfficiencyParams extends ComposedMetricParams {
  /**
   * The time duration that is used for calculating the average CPU utilisation in seconds.
   */
  cpuUtilisationTimeRange: number;

  /**
   * The time duration that is used for calculating the average write load in seconds.
   */
  writeLoadTimeRange: number;
}

/**
 * Represents the type of a generic cost efficiency metric.
 */
export class K8ssandraEfficiencyMetric extends ComposedMetricType<
  K8ssandraEfficiency,
  K8ssandraEfficiencyParams
> {
  /** The singleton instance of this type. */
  static readonly instance = new K8ssandraEfficiencyMetric();

  readonly metricTypeName =
    POLARIS_API.METRICS_GROUP + '/v1/k8ssandra-efficiency';
}

/**
 * Used to configure a K8ssandraEfficiency composed metric controller to compute
 * its metric for a specific target.
 */
export class K8ssandraEfficiencyMetricMapping extends ComposedMetricMapping<
  ComposedMetricMappingSpec<K8ssandraEfficiencyParams>
> {
  constructor(initData?: Partial<K8ssandraEfficiencyMetricMapping>) {
    super(initData);
    this.objectKind = K8ssandraEfficiencyMetricMapping.getMappingObjectKind(
      K8ssandraEfficiencyMetric.instance
    );
  }
}
