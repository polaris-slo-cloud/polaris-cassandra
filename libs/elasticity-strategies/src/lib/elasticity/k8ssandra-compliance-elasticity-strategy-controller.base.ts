import { K8ssandraSloCompliance } from '@nicokratky/slos';
import {
  SloTarget,
  ElasticityStrategyController,
  ElasticityStrategy,
  Logger,
} from '@polaris-sloc/core';

/**
 * Common superclass for elasticity strategy controllers that expect `K8ssandraSloCompliance` objects as input.
 *
 * This class implements `checkIfActionNeeded()` for `K8ssandraSloCompliance` values.
 */
export abstract class K8ssandraSloComplianceElasticityStrategyControllerBase<
  T extends SloTarget = SloTarget,
  C = Record<string, any>
> implements ElasticityStrategyController<K8ssandraSloCompliance, T, C>
{
  abstract execute(
    elasticityStrategy: ElasticityStrategy<K8ssandraSloCompliance, T, C>
  ): Promise<void>;

  abstract onElasticityStrategyDeleted?(
    elasticityStrategy: ElasticityStrategy<K8ssandraSloCompliance, T, C>
  ): void;

  abstract onDestroy?(): void;

  checkIfActionNeeded(
    elasticityStrategy: ElasticityStrategy<K8ssandraSloCompliance, T, C>
  ): Promise<boolean> {
    const sloCompliance = elasticityStrategy.spec.sloOutputParams;
    const tolerance = sloCompliance.tolerance ?? this.getDefaultTolerance();
    const lowerBound = 100 - tolerance;
    const upperBound = 100 + tolerance;

    const verticalActionNeeded =
      sloCompliance.currCpuSloCompliancePercentage < lowerBound ||
      sloCompliance.currCpuSloCompliancePercentage > upperBound ||
      sloCompliance.currMemorySloCompliancePercentage < lowerBound ||
      sloCompliance.currMemorySloCompliancePercentage > upperBound;

    const horizontalActionNeeded =
      sloCompliance.currHorizontalSloCompliancePercentange < lowerBound;

    Logger.log('vertical action needed: ', verticalActionNeeded);
    Logger.log('horizontal action needed: ', horizontalActionNeeded);

    return Promise.resolve(verticalActionNeeded || horizontalActionNeeded);
  }

  /**
   * @returns The default tolerance value if `SloCompliance.tolerance` is not set for an elasticity strategy.
   */
  protected getDefaultTolerance(): number {
    return 10;
  }
}
