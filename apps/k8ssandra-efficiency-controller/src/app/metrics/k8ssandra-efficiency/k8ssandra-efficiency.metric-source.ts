import {
  ComposedMetricSourceBase,
  LabelComparisonOperator,
  Logger,
  MetricsSource,
  OrchestratorGateway,
  Sample,
} from '@polaris-sloc/core';
import {
  K8ssandraEfficiency,
  K8ssandraEfficiencyParams,
} from '@nicokratky/slos';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// ToDo:
// 1. Adapt the list of `supportedSloTargetTypes` in `K8ssandraEfficiencyMetricSourceFactory` (see k8ssandra-efficiency.metric-source.factory.ts).
// 2. Adapt the `K8ssandraEfficiencyMetricSourceFactory.metricSourceName`, if needed (e.g., if there are multiple sources for K8ssandraEfficiencyMetric that differ
//    based on the supported SloTarget types).
// 3. Implement `K8ssandraEfficiencyMetricSource.getValueStream()` to compute the metric.
// 4. Adapt the `release` label in `../../../../manifests/kubernetes/3-service-monitor.yaml` to ensure that Prometheus will scrape this controller.

/**
 * Computes the `K8ssandraEfficiency` composed metric.
 */
export class K8ssandraEfficiencyMetricSource extends ComposedMetricSourceBase<K8ssandraEfficiency> {
  constructor(
    private params: K8ssandraEfficiencyParams,
    metricsSource: MetricsSource,
    orchestrator: OrchestratorGateway
  ) {
    super(metricsSource, orchestrator);
  }

  getValueStream(): Observable<Sample<K8ssandraEfficiency>> {
    return this.getDefaultPollingInterval().pipe(
      switchMap(() => this.getEfficiency()),
    );
  }

  private async getEfficiency(): Promise<Sample<K8ssandraEfficiency>> {
    Logger.log("Getting efficiency metrics");

    const readEfficiencyQuery = this.metricsSource.getTimeSeriesSource()
      .select('mcac', 'client_request_latency_total')
      .filterOnLabel({label: "cassandra_datastax_com_cluster", operator: LabelComparisonOperator.Equal, comparisonValue: "polaris-k8ssandra-cluster"})
      .filterOnLabel({label: "request_type", operator: LabelComparisonOperator.Equal, comparisonValue: "read"});

    const writeEfficiencyQuery = this.metricsSource.getTimeSeriesSource()
      .select('mcac', 'client_request_latency_total')
      .filterOnLabel({label: "cassandra_datastax_com_cluster", operator: LabelComparisonOperator.Equal, comparisonValue: "polaris-k8ssandra-cluster"})
      .filterOnLabel({label: "request_type", operator: LabelComparisonOperator.Equal, comparisonValue: "write"});

    Logger.log("Executing query")

    const readEfficiencyQueryResult = await readEfficiencyQuery.execute();
    const writeEfficiencyQueryResult = await writeEfficiencyQuery.execute();

    Logger.log("readEfficiencyQuery result: ", readEfficiencyQueryResult);
    Logger.log("writeEfficiencyQuery result: ", writeEfficiencyQueryResult);

    let timestamp = 0;
    let readEfficiency = 0;
    let writeEfficiency = 0;

    if (readEfficiencyQueryResult.results?.length > 0) {
      const readEfficiencyResult = readEfficiencyQueryResult.results[0].samples[0];

      Logger.log("readEfficiency sample: ", readEfficiencyResult);

      timestamp = readEfficiencyResult.timestamp;

      readEfficiency = readEfficiencyResult.value;
    }

    if (writeEfficiencyQueryResult.results?.length > 0) {
      const writeEfficiencyResult = writeEfficiencyQueryResult.results[0].samples[0];

      Logger.log("writeEfficiency sample: ", writeEfficiencyResult);

      timestamp = writeEfficiencyResult.timestamp;

      writeEfficiency = writeEfficiencyResult.value;
    }

    return {
      timestamp,
      value: { readEfficiency, writeEfficiency },
    }
  }
}
