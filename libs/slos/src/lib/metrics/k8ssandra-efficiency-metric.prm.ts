import {
  ComposedMetricMapping,
  ComposedMetricMappingSpec,
  ComposedMetricParams,
  ComposedMetricType,
  POLARIS_API,
} from '@polaris-sloc/core';

// ToDo after code generation:
// - Add properties to the K8ssandraEfficiency interface to store the value of a single metric instance.
// - Add configuration parameters to the K8ssandraEfficiencyParams interface, if needed.
// - (optional) Replace `POLARIS_API.METRICS_GROUP` in K8ssandraEfficiencyMetric.metricTypeName with a custom group name.
//   If you change the group name, ensure that you also accordingly adapt the `1-rbac.yaml` files of all
//   composed metric controllers and all SLO controllers that need to write this ComposedMetricType CRD.

/**
 * Represents the value of a K8ssandraEfficiency metric.
 */
export interface K8ssandraEfficiency {
  /**
   * The current read efficiency in the range between 0 and 100.
   */
  readEfficiency: number;

  /**
   * The current write efficiency in the range between 0 and 100.
   */
  writeEfficiency: number;
}

/**
 * The parameters for retrieving the K8ssandraEfficiency metric.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface K8ssandraEfficiencyParams extends ComposedMetricParams {}

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
