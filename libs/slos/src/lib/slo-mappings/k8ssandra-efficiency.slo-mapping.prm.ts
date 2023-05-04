import {
  ObjectKind,
  PolarisType,
  SloCompliance,
  SloMappingBase,
  SloMappingInitData,
  SloMappingSpecBase,
  SloTarget,
  initSelf,
} from '@polaris-sloc/core';

// ToDo after code generation:
// - Add configuration parameters to the K8ssandraEfficiencySloConfig interface.
// - If the SLO does not produce SloCompliance objects as output,
//   adapt the second generic parameter of K8ssandraEfficiencySloMappingSpec accordingly.
// - If the SLO should operate on a subtype of SloTarget,
//   adapt the third generic parameter of K8ssandraEfficiencySloMappingSpec accordingly.
// - (optional) Replace the ObjectKind.group in the constructor of K8ssandraEfficiencySloMapping with your own.
//   If you change the group name, ensure that you also accordingly adapt the `1-rbac.yaml` files of all
//   SLO controllers that need to write this SloMapping CRD.

/**
 * Represents the configuration options of the K8ssandraEfficiency SLO.
 */
export interface K8ssandraEfficiencySloConfig {
  /**
   * The desired target read efficiency in the range between 0 and 100.
   */
  targetReadEfficiency: number;

  /**
   * The desired target write efficiency in the range between 0 and 100.
   */
  targetWriteEfficiency: number;
}

/**
 * The spec type for the K8ssandraEfficiency SLO.
 */
export class K8ssandraEfficiencySloMappingSpec extends SloMappingSpecBase<
  // The SLO's configuration.
  K8ssandraEfficiencySloConfig,
  // The output type of the SLO.
  SloCompliance,
  // The type of target(s) that the SLO can be applied to.
  SloTarget
> {}

/**
 * Represents an SLO mapping for the K8ssandraEfficiency SLO, which can be used to apply and configure the K8ssandraEfficiency SLO.
 */
export class K8ssandraEfficiencySloMapping extends SloMappingBase<K8ssandraEfficiencySloMappingSpec> {
  @PolarisType(() => K8ssandraEfficiencySloMappingSpec)
  spec: K8ssandraEfficiencySloMappingSpec;

  constructor(initData?: SloMappingInitData<K8ssandraEfficiencySloMapping>) {
    super(initData);
    this.objectKind = new ObjectKind({
      group: 'slo.polaris-slo-cloud.github.io',
      version: 'v1',
      kind: 'K8ssandraEfficiencySloMapping',
    });
    initSelf(this, initData);
  }
}
