import {
  ComposedMetricSourceBase,
  Duration,
  Join,
  LabelComparisonOperator,
  LabelGrouping,
  Logger,
  MetricsSource,
  OrchestratorGateway,
  Sample,
  TimeRange,
} from '@polaris-sloc/core';
import {
  K8ssandraEfficiency,
  K8ssandraEfficiencyParams,
} from '@nicokratky/slos';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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
      switchMap(() => this.getEfficiency())
    );
  }

  private async getEfficiency(): Promise<Sample<K8ssandraEfficiency>> {
    Logger.log('Getting efficiency metrics');

    const avgCpuUtilisation = await this.getAverageCpuUtilisation();
    const avgMemoryUtilisation = await this.getAverageMemoryUtilisation();
    const avgWriteLoadPerNode = await this.getAverageWritesTotal();

    const efficiency = {
      timestamp: avgWriteLoadPerNode.timestamp,
      value: {
        avgCpuUtilisation: 0.6, // TODO
        avgMemoryUtilisation: avgMemoryUtilisation.value,
        avgWriteLoadPerNode: avgWriteLoadPerNode.value,
      },
    };

    Logger.log('Exposed metric: ', efficiency);

    return efficiency;
  }

  private async getAverageWritesTotal() {
    const writeEfficiencyQuery = this.metricsSource
      .getTimeSeriesSource()
      .select(
        'mcac',
        'client_request_latency_total',
        TimeRange.fromDuration(
          Duration.fromSeconds(this.params.writeLoadTimeRange)
        )
      )
      .filterOnLabel({
        label: 'cassandra_datastax_com_cluster',
        operator: LabelComparisonOperator.Equal,
        comparisonValue: this.params.sloTarget.name,
      })
      .filterOnLabel({
        label: 'request_type',
        operator: LabelComparisonOperator.Equal,
        comparisonValue: 'write',
      })
      .rate()
      .sumByGroup(LabelGrouping.by('cluster', 'request_type'));

    const writeEfficiencyQueryResult = await writeEfficiencyQuery.execute();

    const nodeCount = await this.getNodeCount();

    Logger.log('Node Count:', nodeCount);

    const writeEfficiencyResult =
      writeEfficiencyQueryResult.results[0].samples[0];

    const avgWriteLoadPerNode = writeEfficiencyResult.value / nodeCount;

    Logger.log('writeEfficiency sample: ', writeEfficiencyResult);

    return {
      timestamp: writeEfficiencyResult.timestamp,
      value: avgWriteLoadPerNode,
    };
  }

  private async getAverageCpuUtilisation() {
    // avg by (cluster) (
    //     1
    //   -
    //     (
    //         sum by (cluster, dc, rack, instance) (
    //           rate(
    //             collectd_cpu_total{cluster="polaris-k8ssandra-cluster",dc=~".*",instance=~".*",rack=~".*",type="idle"}[10m]
    //           )
    //         )
    //       /
    //         sum by (cluster, dc, rack, instance) (
    //           rate(
    //             collectd_cpu_total{cluster="polaris-k8ssandra-cluster",dc=~".*",instance=~".*",rack=~".*"}[10m]
    //           )
    //         )
    //     )
    // )

    const idleCpuUsageQuery = this.metricsSource
      .getTimeSeriesSource()
      .select(
        'collectd',
        'cpu_total',
        TimeRange.fromDuration(
          Duration.fromSeconds(this.params.cpuUtilisationTimeRange)
        )
      )
      .filterOnLabel({
        label: 'type',
        operator: LabelComparisonOperator.Equal,
        comparisonValue: 'idle',
      })
      .filterOnLabel({
        label: 'cluster',
        operator: LabelComparisonOperator.Equal,
        comparisonValue: this.params.sloTarget.name,
      })
      .rate()
      .sumByGroup(LabelGrouping.by('cluster', 'dc', 'rack', 'instance'));

    const cpuUsageQuery = this.metricsSource
      .getTimeSeriesSource()
      .select(
        'collectd',
        'cpu_total',
        TimeRange.fromDurationWithOffset(
          Duration.fromSeconds(30),
          Duration.fromSeconds(30)
        )
      )
      .filterOnLabel({
        label: 'cluster',
        operator: LabelComparisonOperator.Equal,
        comparisonValue: this.params.sloTarget.name,
      })
      .rate()
      .sumByGroup(LabelGrouping.by('cluster', 'dc', 'rack', 'instance'));

    const avgCpuUtilisationQuery = idleCpuUsageQuery
      .divideBy(cpuUsageQuery)
      .averageByGroup(LabelGrouping.by('cluster'));

    const avgCpuUtilisationQueryResult = await avgCpuUtilisationQuery.execute();

    let timestamp, avgCpuUtilisationValue;

    if (avgCpuUtilisationQueryResult.results.length > 0) {
      const avgCpuUtilisationResult =
        avgCpuUtilisationQueryResult.results[0].samples[0];

      Logger.log('avgCpuUtilisation sample: ', avgCpuUtilisationResult);

      timestamp = avgCpuUtilisationResult.timestamp;
      avgCpuUtilisationValue = 1 - avgCpuUtilisationResult.value;
    }

    return {
      timestamp,
      value: avgCpuUtilisationValue,
    };
  }

  private async getAverageMemoryUtilisation() {
    // max(
    //     sum by (pod) (
    //         container_memory_working_set_bytes{cluster="",container!="",image!="",namespace="k8ssandra"}
    //       * on (namespace, pod) group_left (workload, workload_type)
    //         namespace_workload_pod:kube_pod_owner:relabel{cluster="",namespace="k8ssandra",workload="polaris-k8ssandra-cluster-dc1-default-sts",workload_type="statefulset"}
    //     )
    //   /
    //     sum by (pod) (
    //         kube_pod_container_resource_limits{cluster="",job="kube-state-metrics",namespace="k8ssandra",resource="memory"}
    //       * on (namespace, pod) group_left (workload, workload_type)
    //         namespace_workload_pod:kube_pod_owner:relabel{cluster="",namespace="k8ssandra",workload="polaris-k8ssandra-cluster-dc1-default-sts",workload_type="statefulset"}
    //     )
    // )

    const nodeMemoryUsage = this.metricsSource
      .getTimeSeriesSource()
      .select('container', 'memory_working_set_bytes')
      .filterOnLabel({
        label: 'cluster',
        operator: LabelComparisonOperator.Equal,
        comparisonValue: '',
      })
      .filterOnLabel({
        label: 'container',
        operator: LabelComparisonOperator.NotEqual,
        comparisonValue: '',
      })
      .filterOnLabel({
        label: 'image',
        operator: LabelComparisonOperator.NotEqual,
        comparisonValue: '',
      })
      .filterOnLabel({
        label: 'namespace',
        operator: LabelComparisonOperator.Equal,
        comparisonValue: this.params.namespace,
      })
      .multiplyBy(
        this.metricsSource
          .getTimeSeriesSource()
          .select('namespace', 'workload_pod:kube_pod_owner:relabel')
          .filterOnLabel({
            label: 'cluster',
            operator: LabelComparisonOperator.Equal,
            comparisonValue: '',
          })
          .filterOnLabel({
            label: 'namespace',
            operator: LabelComparisonOperator.Equal,
            comparisonValue: this.params.namespace,
          })
          .filterOnLabel({
            label: 'workload',
            operator: LabelComparisonOperator.RegexMatch,
            comparisonValue: this.params.sloTarget.name + '-.*-sts',
          })
          .filterOnLabel({
            label: 'workload_type',
            operator: LabelComparisonOperator.Equal,
            comparisonValue: 'statefulset',
          }),
        Join.onLabels('namespace', 'pod').groupLeft('workload', 'workload_type')
      )
      .sumByGroup(LabelGrouping.by('pod'));

    const nodeLimits = this.metricsSource
      .getTimeSeriesSource()
      .select('kube', 'pod_container_resource_limits')
      .filterOnLabel({
        label: 'cluster',
        operator: LabelComparisonOperator.Equal,
        comparisonValue: '',
      })
      .filterOnLabel({
        label: 'job',
        operator: LabelComparisonOperator.Equal,
        comparisonValue: 'kube-state-metrics',
      })
      .filterOnLabel({
        label: 'namespace',
        operator: LabelComparisonOperator.Equal,
        comparisonValue: this.params.namespace,
      })
      .filterOnLabel({
        label: 'resource',
        operator: LabelComparisonOperator.Equal,
        comparisonValue: 'memory',
      })
      .multiplyBy(
        this.metricsSource
          .getTimeSeriesSource()
          .select('namespace', 'workload_pod:kube_pod_owner:relabel')
          .filterOnLabel({
            label: 'cluster',
            operator: LabelComparisonOperator.Equal,
            comparisonValue: '',
          })
          .filterOnLabel({
            label: 'namespace',
            operator: LabelComparisonOperator.Equal,
            comparisonValue: this.params.namespace,
          })
          .filterOnLabel({
            label: 'workload',
            operator: LabelComparisonOperator.RegexMatch,
            comparisonValue: this.params.sloTarget.name + '-.*-sts',
          })
          .filterOnLabel({
            label: 'workload_type',
            operator: LabelComparisonOperator.Equal,
            comparisonValue: 'statefulset',
          }),
        Join.onLabels('namespace', 'pod').groupLeft('workload', 'workload_type')
      )
      .sumByGroup(LabelGrouping.by('pod'));

    const memoryUtilisationQuery = nodeMemoryUsage
      .divideBy(nodeLimits)
      .maxByGroup();
    const memoryUtilisationResult = await memoryUtilisationQuery.execute();

    let timestamp, avgMemoryUtilisationValue;

    if (memoryUtilisationResult.results.length > 0) {
      const avgMemoryUtilisationResult =
        memoryUtilisationResult.results[0].samples[0];

      Logger.log('avgMemoryUtilisation sample: ', avgMemoryUtilisationResult);

      timestamp = avgMemoryUtilisationResult.timestamp;
      avgMemoryUtilisationValue = avgMemoryUtilisationResult.value;
    }

    return {
      timestamp,
      value: avgMemoryUtilisationValue,
    };
  }

  private async getNodeCount() {
    // count(mcac_compaction_completed_tasks{cluster=~"polaris-k8ssandra-cluster"} >= 0)

    const nodeCountQuery = this.metricsSource
      .getTimeSeriesSource()
      .select('mcac', 'compaction_completed_tasks')
      .filterOnLabel({
        label: 'cluster',
        operator: LabelComparisonOperator.Equal,
        comparisonValue: this.params.sloTarget.name,
      });

    const nodeCountQueryResult = await nodeCountQuery.execute();

    return nodeCountQueryResult.results.length;
  }
}
