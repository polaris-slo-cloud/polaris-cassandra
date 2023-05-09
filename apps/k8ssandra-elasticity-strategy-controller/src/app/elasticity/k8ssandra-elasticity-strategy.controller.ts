import {
  ApiObjectMetadata,
  DefaultStabilizationWindowTracker,
  Logger,
  OrchestratorClient,
  PolarisRuntime,
  SloComplianceElasticityStrategyControllerBase,
  SloTarget,
  StabilizationWindowTracker,
} from '@polaris-sloc/core';
import {
  K8ssandraElasticityStrategyConfig,
  K8ssandraElasticityStrategy,
  K8ssandraCluster,
} from '@nicokratky/elasticity-strategies';

/** Tracked executions eviction interval of 20 minutes. */
const EVICTION_INTERVAL_MSEC = 20 * 60 * 1000;

/**
 * Controller for the K8ssandraElasticityStrategy.
 *
 * ToDo:
 *  1. If you want to restrict the type of workloads that this elasticity strategy can be applied to,
 *     change the first generic parameter from `SloTarget` to the appropriate type.
 *  2. If your elasticity strategy input is not of type `SloCompliance`, change the definition of the controller class
 *     to extend `ElasticityStrategyController` instead of `SloComplianceElasticityStrategyControllerBase`.
 *  3. Implement the `execute()` method.
 *  4. Adapt `manifests/1-rbac.yaml` to include get and update permissions on all resources that you update in the orchestrator during `execute()`.
 */
export class K8ssandraElasticityStrategyController extends SloComplianceElasticityStrategyControllerBase<
  SloTarget,
  K8ssandraElasticityStrategyConfig
> {
  /** The client for accessing orchestrator resources. */
  private orchClient: OrchestratorClient;

  /** Tracks the stabilization windows of the ElasticityStrategy instances. */
  private stabilizationWindowTracker: StabilizationWindowTracker<K8ssandraElasticityStrategy> =
    new DefaultStabilizationWindowTracker();

  private evictionInterval: NodeJS.Timeout;

  constructor(polarisRuntime: PolarisRuntime) {
    super();
    this.orchClient = polarisRuntime.createOrchestratorClient();

    this.evictionInterval = setInterval(
      () => this.stabilizationWindowTracker.evictExpiredExecutions(),
      EVICTION_INTERVAL_MSEC
    );
  }

  async execute(
    elasticityStrategy: K8ssandraElasticityStrategy
  ): Promise<void> {
    Logger.log('Executing elasticity strategy: ', elasticityStrategy);

    const k8c = await this.loadTarget(elasticityStrategy);

    Logger.log('k8c:', k8c);
    Logger.log('dcs:', k8c.spec.cassandra.datacenters);
    Logger.log('resources:', k8c.spec.cassandra.resources);

    k8c.spec.cassandra.resources.requests.memory = '333M';

    await this.orchClient.update(k8c);

    Logger.log('Successfully scaled.', elasticityStrategy, k8c);
  }

  onDestroy(): void {
    clearInterval(this.evictionInterval);
  }

  onElasticityStrategyDeleted(
    elasticityStrategy: K8ssandraElasticityStrategy
  ): void {
    this.stabilizationWindowTracker.removeElasticityStrategy(
      elasticityStrategy
    );
  }

  private async loadTarget(
    elasticityStrategy: K8ssandraElasticityStrategy
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
}
