import { ApiObject, ObjectKind, PolarisType, initSelf } from '@polaris-sloc/core';

export class K8ssandraClusterSpec {
  cassandra: CassandraSpec;
}

export class CassandraSpec {
  clusterName: string;

  datacenters: [{
    /**
     * Size is the number Cassandra pods to deploy in this datacenter.
     */
    size: number;

    /**
     * Stopped means that the datacenter will be stopped. Use this for maintenance or for cost saving.
     * A stopped CassandraDatacenter will have no running server pods, like using "stop" with traditional System V init
     * scripts. Other Kubernetes resources will be left intact, and volumes will re-attach when the CassandraDatacenter
     *  workload is resumed.
     */
    stopped: boolean;
  }];

  /**
   * Resources is the cpu and memory resources for the cassandra container.
   */
  resources: {
    /**
     * Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it
     * defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value.
     */
    requests?: {
      cpu: string,
      memory: string,
    },
    /**
     * Limits describes the maximum amount of compute resources allowed.
     */
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
