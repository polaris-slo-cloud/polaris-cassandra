import { initSelf } from '@polaris-sloc/core';

export class K8ssandraSloCompliance {
  currVerticalSloCompliancePercentage: number;

  currHorizontalSloCompliancePercentange: number;

  tolerance?: number;

  constructor(initData?: Partial<K8ssandraSloCompliance>) {
    initSelf(this, initData);
  }
}
