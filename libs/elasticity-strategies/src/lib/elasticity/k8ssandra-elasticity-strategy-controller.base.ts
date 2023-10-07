import {
  ApiObjectMetadata,
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
    Logger.log('Resources:', k8c.spec.cassandra.resources);

    let updatedK8c = await this.updateK8ssandraCluster(elasticityStrategy, k8c);

    if (updatedK8c == null) {
      // can't update K8ssandraCluster
      // probably outside stabilization window
      return;
    }

    updatedK8c = this.normalize(k8c, elasticityStrategy.spec.staticConfig);

    await this.orchClient.update(updatedK8c);
    this.stabilizationWindowTracker.trackExecution(elasticityStrategy);

    Logger.log('Successfully updated K8ssandraCluster:', updatedK8c);
    Logger.log('New resources:', updatedK8c.spec.cassandra.resources);
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
    const resources = k8c.spec.cassandra.resources;
    let newSize = k8c.spec.cassandra.datacenters[0].size;

    Logger.log('Resources to normalize:', resources);

    resources.memoryMiB = Math.max(resources.memoryMiB, config.minResources?.memoryMiB ?? 1);
    resources.memoryMiB = Math.min(resources.memoryMiB, config.maxResources?.memoryMiB ?? Infinity);

    resources.milliCpu = Math.max(resources.milliCpu, config.minResources?.milliCpu ?? 1);
    resources.milliCpu = Math.min(resources.milliCpu, config.maxResources?.milliCpu ?? Infinity);

    newSize = Math.max(newSize, config.minNodes ?? 1);
    newSize = Math.min(newSize, config.maxNodes ?? Infinity);

    k8c.spec.cassandra.resources = resources;
    k8c.spec.cassandra.datacenters[0].size = newSize;

    return k8c;
  }
}
