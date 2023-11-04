import {
  DefaultStabilizationWindowTracker,
  OrchestratorClient,
  PolarisRuntime,
  SloComplianceElasticityStrategyControllerBase,
  SloTarget,
  StabilizationWindowTracker,
} from '@polaris-sloc/core';
import {
  K8ssandraVerticalElasticityStrategyConfig,
  K8ssandraVerticalElasticityStrategy,
} from '@nicokratky/elasticity-strategies';

/** Tracked executions eviction interval of 20 minutes. */
const EVICTION_INTERVAL_MSEC = 20 * 60 * 1000;

/**
 * Controller for the K8ssandraVerticalElasticityStrategy.
 *
 * ToDo:
 *  1. If you want to restrict the type of workloads that this elasticity strategy can be applied to,
 *     change the first generic parameter from `SloTarget` to the appropriate type.
 *  2. If your elasticity strategy input is not of type `SloCompliance`, change the definition of the controller class
 *     to extend `ElasticityStrategyController` instead of `SloComplianceElasticityStrategyControllerBase`.
 *  3. Implement the `execute()` method.
 *  4. Adapt `manifests/1-rbac.yaml` to include get and update permissions on all resources that you update in the orchestrator during `execute()`.
 */
export class K8ssandraVerticalElasticityStrategyController extends SloComplianceElasticityStrategyControllerBase<
  SloTarget,
  K8ssandraVerticalElasticityStrategyConfig
> {
  /** The client for accessing orchestrator resources. */
  private orchClient: OrchestratorClient;

  /** Tracks the stabilization windows of the ElasticityStrategy instances. */
  private stabilizationWindowTracker: StabilizationWindowTracker<K8ssandraVerticalElasticityStrategy> =
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
    elasticityStrategy: K8ssandraVerticalElasticityStrategy
  ): Promise<void> {
    // ToDo: Implement this method
  }

  onDestroy(): void {
    clearInterval(this.evictionInterval);
  }

  onElasticityStrategyDeleted(
    elasticityStrategy: K8ssandraVerticalElasticityStrategy
  ): void {
    this.stabilizationWindowTracker.removeElasticityStrategy(
      elasticityStrategy
    );
  }
}
