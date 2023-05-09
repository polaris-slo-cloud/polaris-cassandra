import { ApiObject, ObjectKind, PolarisType, initSelf } from '@polaris-sloc/core';

export class K8ssandraClusterSpec {
  cassandra: CassandraSpec;
}

export class CassandraSpec {
  datacenters: [{
    size: number,
  }];

  resources: {
    requests?: {
      cpu: string,
      memory: string,
    },
    limits?: {
      cpu: string,
      memory: string,
    }
  };
}

/**
 * Represents a K8ssandraCluster type.
 */
export class K8ssandraCluster extends ApiObject<K8ssandraClusterSpec> {

  @PolarisType(() => K8ssandraClusterSpec)
  spec: K8ssandraClusterSpec;

  constructor(initData?: Partial<K8ssandraCluster>) {
    super(initData);
    this.objectKind = new ObjectKind({
      group: 'k8ssandra.io',
      version: 'v1alpha1',
      kind: 'K8ssandraCluster',
    });
    initSelf(this, initData);
  }
}
