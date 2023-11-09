import {
  K8ssandraEfficiency,
  K8ssandraEfficiencyMetric,
  K8ssandraEfficiencyParams,
  K8ssandraVerticalEfficiencySloConfig,
  K8ssandraVerticalSloCompliance,
} from '@nicokratky/slos';
import {
  ComposedMetricSource,
  Logger,
  MetricsSource,
  ObservableOrPromise,
  OrchestratorGateway,
  ServiceLevelObjective,
  SloMapping,
  SloOutput,
  createOwnerReference,
} from '@polaris-sloc/core';
import { of } from 'rxjs';

/**
 * Implements the K8ssandraVerticalEfficiency SLO.
 *
 * ToDo: Change SloOutput type if necessary.
 */
export class K8ssandraVerticalEfficiencySlo
  implements
    ServiceLevelObjective<
      K8ssandraVerticalEfficiencySloConfig,
      K8ssandraVerticalSloCompliance
    >
{
  sloMapping: SloMapping<
    K8ssandraVerticalEfficiencySloConfig,
    K8ssandraVerticalSloCompliance
  >;

  private metricsSource: MetricsSource;
  private efficiencyMetricSource: ComposedMetricSource<K8ssandraEfficiency>;

  configure(
    sloMapping: SloMapping<
      K8ssandraVerticalEfficiencySloConfig,
      K8ssandraVerticalSloCompliance
    >,
    metricsSource: MetricsSource,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    orchestrator: OrchestratorGateway
  ): ObservableOrPromise<void> {
    this.sloMapping = sloMapping;
    this.metricsSource = metricsSource;

    const efficiencyParams: K8ssandraEfficiencyParams = {
      cpuUtilisationTimeRange: 300,
      writeLoadTimeRange: null,
      namespace: sloMapping.metadata.namespace,
      sloTarget: sloMapping.spec.targetRef,
      owner: createOwnerReference(sloMapping),
    };

    this.efficiencyMetricSource = metricsSource.getComposedMetricSource(
      K8ssandraEfficiencyMetric.instance,
      efficiencyParams
    );

    return of(undefined);
  }

  async evaluate(): Promise<SloOutput<K8ssandraVerticalSloCompliance>> {
    Logger.log('Evaluating SLO compliance');

    const sample = await this.efficiencyMetricSource
      .getCurrentValue()
      .toPromise();

    Logger.log('current sample: ', sample);

    const cpuCompliance = this.calculateCpuSloCompliance(sample.value);
    const memoryCompliance = this.calculateMemorySloCompliance(sample.value);

    return {
      sloMapping: this.sloMapping,
      elasticityStrategyParams: {
        currCpuSloCompliancePercentage: cpuCompliance,
        currMemorySloCompliancePercentage: memoryCompliance,
        tolerance: this.sloMapping.spec.sloConfig.tolerance,
      },
    };
  }

  private calculateCpuSloCompliance(sample: K8ssandraEfficiency): number {
    const cpuTarget = this.sloMapping.spec.sloConfig.targetCpuUtilisation;
    const cpuCompliance = Math.ceil(
      (cpuTarget / (sample.avgCpuUtilisation * 100)) * 100
    );
    Logger.log('cpuCompliance: ', cpuCompliance);
    return cpuCompliance;
  }

  private calculateMemorySloCompliance(sample: K8ssandraEfficiency): number {
    const memTarget = this.sloMapping.spec.sloConfig.targetMemoryUtilisation;
    const memCompliance = Math.ceil(
      (memTarget / (sample.avgMemoryUtilisation * 100)) * 100
    );
    Logger.log('memCompliance: ', memCompliance);
    return memCompliance;
  }
}
