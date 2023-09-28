import {
  ApiObjectMetadata,
  ContainerResources,
  DefaultStabilizationWindowTracker,
  ElasticityStrategy,
  Logger,
  OrchestratorClient,
  PolarisRuntime,
  SloTarget,
  StabilizationWindowTracker,
} from '@polaris-sloc/core';
import { K8ssandraElasticityStrategyConfig } from './k8ssandra-elasticity-strategy.prm';
import { K8ssandraCluster } from '../k8ssandra-cluster.prm';
import { K8ssandraSloComplianceElasticityStrategyControllerBase } from './k8ssandra-compliance-elasticity-strategy-controller.base';
import { K8ssandraSloCompliance } from '@nicokratky/slos';

/** Tracked executions eviction interval of 20 minutes. */
const EVICTION_INTERVAL_MSEC = 20 * 60 * 1000;

export abstract class K8ssandraElasticityStrategyControllerBase<
  T extends SloTarget,
  C extends K8ssandraElasticityStrategyConfig
> extends K8ssandraSloComplianceElasticityStrategyControllerBase<T, C> {
  /** The client for accessing orchestrator resources. */
  protected orchClient: OrchestratorClient;

  /** Tracks the stabilization windows of the ElasticityStrategy instances. */
  protected stabilizationWindowTracker: StabilizationWindowTracker<
    ElasticityStrategy<K8ssandraSloCompliance, T, C>
  > = new DefaultStabilizationWindowTracker();

  private evictionInterval: NodeJS.Timeout;

  constructor(polarisRuntime: PolarisRuntime) {
    super();
    this.orchClient = polarisRuntime.createOrchestratorClient();

    this.evictionInterval = setInterval(
      () => this.stabilizationWindowTracker.evictExpiredExecutions(),
      EVICTION_INTERVAL_MSEC
    );
  }

  protected abstract updateK8ssandraCluster(
    elasticityStrategy: ElasticityStrategy<K8ssandraSloCompliance, T, C>,
    k8c: K8ssandraCluster
  ): Promise<K8ssandraCluster>;

  async execute(
    elasticityStrategy: ElasticityStrategy<K8ssandraSloCompliance, T, C>
  ): Promise<void> {
    Logger.log('Executing elasticity strategy:', elasticityStrategy);

    const k8c = await this.loadTarget(elasticityStrategy);
    Logger.log('Loaded K8ssandraCluster:', k8c);

    let updatedK8c = await this.updateK8ssandraCluster(elasticityStrategy, k8c);

    if (updatedK8c == null) {
      // can't update K8ssandraCluster
      // probably outside stabilization window
      return;
    }

    updatedK8c = this.normalize(k8c, elasticityStrategy.spec.staticConfig);
    updatedK8c = this.normalizeResources(k8c);

    await this.orchClient.update(updatedK8c);
    this.stabilizationWindowTracker.trackExecution(elasticityStrategy);
    Logger.log(
      'Successfully updated K8ssandraCluster:',
      JSON.stringify(updatedK8c, null, 2)
    );
  }

  onDestroy(): void {
    clearInterval(this.evictionInterval);
  }

  onElasticityStrategyDeleted(
    elasticityStrategy: ElasticityStrategy<K8ssandraSloCompliance, T, C>
  ): void {
    this.stabilizationWindowTracker.removeElasticityStrategy(
      elasticityStrategy
    );
  }

  private async loadTarget(
    elasticityStrategy: ElasticityStrategy<K8ssandraSloCompliance, T, C>
  ): Promise<K8ssandraCluster> {
    const targetRef = elasticityStrategy.spec.targetRef;
    const queryApiObject = new K8ssandraCluster({
      metadata: new ApiObjectMetadata({
        namespace: elasticityStrategy.metadata.namespace,
        name: targetRef.name,
      }),
    });

    const k8c = await this.orchClient.read(queryApiObject);

    // parse limits to ContainerResources
    // TODO make nice

    const limitMemory = k8c.spec.cassandra.resources.limits['memory'] as string;
    const limitCpu = k8c.spec.cassandra.resources.limits['cpu'] as string;

    Logger.log(limitMemory);
    Logger.log(limitCpu);

    const limitMemoryUnit = limitMemory.slice(-2);
    const limitCpuUnit = limitCpu.slice(-1);

    if (limitMemoryUnit == 'Mi' && limitCpuUnit == 'm') {
      // yay

      const limits = new ContainerResources({
        memoryMiB: parseInt(limitMemory.slice(0, -2)),
        milliCpu: parseInt(limitCpu.slice(0, -1)),
      });

      k8c.spec.cassandra.resources.limits = limits;
    }

    // parse requests to ContainerResources
    // TODO make nice

    const requestsMemory = k8c.spec.cassandra.resources.requests[
      'memory'
    ] as string;
    const requestsCpu = k8c.spec.cassandra.resources.requests['cpu'] as string;

    const requestsMemoryUnit = requestsMemory.slice(-2);
    const requestsCpuUnit = requestsCpu.slice(-1);

    if (requestsMemoryUnit == 'Mi' && requestsCpuUnit == 'm') {
      // yay

      const requests = new ContainerResources({
        memoryMiB: parseInt(requestsMemory.slice(0, -2)),
        milliCpu: parseInt(requestsCpu.slice(0, -1)),
      });

      k8c.spec.cassandra.resources.requests = requests;
    }

    return k8c;
  }

  /**
   * Normalize the K8ssandraCluster CRD to be within the min/max range
   * of nodes and resources.
   *
   * @param k8c
   * @param config
   * @returns
   */
  private normalize(k8c: K8ssandraCluster, config: C): K8ssandraCluster {
    let newSize = k8c.spec.cassandra.datacenters[0].size;

    newSize = Math.max(newSize, config.minNodes ?? 1);
    newSize = Math.min(newSize, config.maxNodes ?? Infinity);

    k8c.spec.cassandra.datacenters[0].size = newSize;

    return k8c;
  }

  private normalizeResources(k8c: K8ssandraCluster): K8ssandraCluster {
    const requests = k8c.spec.cassandra.resources.requests;
    const limits = k8c.spec.cassandra.resources.limits;

    k8c.spec.cassandra.resources.requests['memory'] = `${requests.memoryMiB}Mi`;
    k8c.spec.cassandra.resources.requests['cpu'] = `${requests.milliCpu}m`;

    k8c.spec.cassandra.resources.limits['memory'] = `${limits.memoryMiB}Mi`;
    k8c.spec.cassandra.resources.limits['cpu'] = `${limits.milliCpu}m`;

    delete k8c.spec.cassandra.resources.requests.memoryMiB;
    delete k8c.spec.cassandra.resources.requests.milliCpu;
    delete k8c.spec.cassandra.resources.limits.memoryMiB;
    delete k8c.spec.cassandra.resources.limits.milliCpu;

    return k8c;
  }
}
