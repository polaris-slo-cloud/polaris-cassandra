import { initSelf } from '@polaris-sloc/core';

export class K8ssandraVerticalSloCompliance {
  currCpuSloCompliancePercentage: number;

  currMemorySloCompliancePercentage: number;

  tolerance?: number;

  constructor(initData?: Partial<K8ssandraVerticalSloCompliance>) {
    initSelf(this, initData);
  }
}
