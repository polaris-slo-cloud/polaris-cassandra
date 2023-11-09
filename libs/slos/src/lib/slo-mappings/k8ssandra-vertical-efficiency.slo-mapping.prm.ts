import {
  ObjectKind,
  PolarisType,
  SloMappingBase,
  SloMappingInitData,
  SloMappingSpecBase,
  SloTarget,
  initSelf,
} from '@polaris-sloc/core';
import { K8ssandraVerticalSloCompliance } from '../compliance/k8ssandra-vertical-compliance.prm';

/**
 * Represents the configuration options of the K8ssandraVerticalEfficiency SLO.
 */
export interface K8ssandraVerticalEfficiencySloConfig {
  /**
   * The desired target CPU utilisation in percent.
   *
   * @minimum 0
   * @maxiumum 100
   */
  targetCpuUtilisation: number;

  /**
   * The desired target memory utilisation in percent.
   *
   * @minimum 0
   * @maxiumum 100
   */
  targetMemoryUtilisation: number;

  /**
   * Specifies the tolerance within which no scaling will be performed
   *
   * @minimum 0
   * @default 10
   */
  tolerance?: number;
}

/**
 * The spec type for the K8ssandraVerticalEfficiency SLO.
 */
export class K8ssandraVerticalEfficiencySloMappingSpec extends SloMappingSpecBase<
  // The SLO's configuration.
  K8ssandraVerticalEfficiencySloConfig,
  // The output type of the SLO.
  K8ssandraVerticalSloCompliance,
  // The type of target(s) that the SLO can be applied to.
  SloTarget
> {}

/**
 * Represents an SLO mapping for the K8ssandraVerticalEfficiency SLO, which can be used to apply and configure the K8ssandraVerticalEfficiency SLO.
 */
export class K8ssandraVerticalEfficiencySloMapping extends SloMappingBase<K8ssandraVerticalEfficiencySloMappingSpec> {
  @PolarisType(() => K8ssandraVerticalEfficiencySloMappingSpec)
  spec: K8ssandraVerticalEfficiencySloMappingSpec;

  constructor(
    initData?: SloMappingInitData<K8ssandraVerticalEfficiencySloMapping>
  ) {
    super(initData);
    this.objectKind = new ObjectKind({
      group: 'slo.polaris-slo-cloud.github.io',
      version: 'v1',
      kind: 'K8ssandraVerticalEfficiencySloMapping',
    });
    initSelf(this, initData);
  }
}
