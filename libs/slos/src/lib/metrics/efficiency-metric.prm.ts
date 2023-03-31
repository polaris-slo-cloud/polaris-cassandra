import {
  ComposedMetricMapping,
  ComposedMetricMappingSpec,
  ComposedMetricParams,
  ComposedMetricType,
  POLARIS_API,
} from '@polaris-sloc/core';

// ToDo after code generation:
// - Add properties to the Efficiency interface to store the value of a single metric instance.
// - Add configuration parameters to the EfficiencyParams interface, if needed.
// - (optional) Replace `POLARIS_API.METRICS_GROUP` in EfficiencyMetric.metricTypeName with a custom group name.
//   If you change the group name, ensure that you also accordingly adapt the `1-rbac.yaml` files of all
//   composed metric controllers and all SLO controllers that need to write this ComposedMetricType CRD.

/**
 * Represents the value of a Efficiency metric.
 */
export interface Efficiency {
  /**
   * The current efficiency in the range 0 to 100.
   */
  efficiency: number;
}

/**
 * The parameters for retrieving the Efficiency metric.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EfficiencyParams extends ComposedMetricParams {}

/**
 * Represents the type of a generic cost efficiency metric.
 */
export class EfficiencyMetric extends ComposedMetricType<
  Efficiency,
  EfficiencyParams
> {
  /** The singleton instance of this type. */
  static readonly instance = new EfficiencyMetric();

  readonly metricTypeName = POLARIS_API.METRICS_GROUP + '/v1/efficiency';
}

/**
 * Used to configure a Efficiency composed metric controller to compute
 * its metric for a specific target.
 */
export class EfficiencyMetricMapping extends ComposedMetricMapping<
  ComposedMetricMappingSpec<EfficiencyParams>
> {
  constructor(initData?: Partial<EfficiencyMetricMapping>) {
    super(initData);
    this.objectKind = EfficiencyMetricMapping.getMappingObjectKind(
      EfficiencyMetric.instance
    );
  }
}
