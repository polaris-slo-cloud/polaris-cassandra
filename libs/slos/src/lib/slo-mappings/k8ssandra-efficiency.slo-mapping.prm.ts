import {
  ObjectKind,
  PolarisType,
  SloMappingBase,
  SloMappingInitData,
  SloMappingSpecBase,
  SloTarget,
  initSelf,
} from '@polaris-sloc/core';
import { K8ssandraSloCompliance } from '../compliance/k8ssandra-compliance.prm';

/**
 * Represents the configuration options of the K8ssandraEfficiency SLO.
 */
export interface K8ssandraEfficiencySloConfig {
  targetCpuUtilisation: number;

  targetMemoryUtilisation: number;

  /**
   * The desired target write efficiency in the range between 0 and 100.
   */
  targetWriteEfficiency: number;

   /**
   * Specifies the tolerance within which no scaling will be performed
   *
   * @minimum 0
   * @default 10
   */
  tolerance?: number;
}

/**
 * The spec type for the K8ssandraEfficiency SLO.
 */
export class K8ssandraEfficiencySloMappingSpec extends SloMappingSpecBase<
  // The SLO's configuration.
  K8ssandraEfficiencySloConfig,
  // The output type of the SLO.
  K8ssandraSloCompliance,
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
