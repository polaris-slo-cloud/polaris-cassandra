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

/**
 * Represents the configuration options of the K8ssandraAvgWriteLoad SLO.
 */
export interface K8ssandraAvgWriteLoadSloConfig {
  /**
   * The desired target write load per k8ssandra node.
   */
  targetWriteLoadPerNode: number;
}

/**
 * The spec type for the K8ssandraAvgWriteLoad SLO.
 */
export class K8ssandraAvgWriteLoadSloMappingSpec extends SloMappingSpecBase<
  // The SLO's configuration.
  K8ssandraAvgWriteLoadSloConfig,
  // The output type of the SLO.
  SloCompliance,
  // The type of target(s) that the SLO can be applied to.
  SloTarget
> {}

/**
 * Represents an SLO mapping for the K8ssandraAvgWriteLoad SLO, which can be used to apply and configure the K8ssandraAvgWriteLoad SLO.
 */
export class K8ssandraAvgWriteLoadSloMapping extends SloMappingBase<K8ssandraAvgWriteLoadSloMappingSpec> {
  @PolarisType(() => K8ssandraAvgWriteLoadSloMappingSpec)
  spec: K8ssandraAvgWriteLoadSloMappingSpec;

  constructor(initData?: SloMappingInitData<K8ssandraAvgWriteLoadSloMapping>) {
    super(initData);
    this.objectKind = new ObjectKind({
      group: 'slo.polaris-slo-cloud.github.io',
      version: 'v1',
      kind: 'K8ssandraAvgWriteLoadSloMapping',
    });
    initSelf(this, initData);
  }
}
