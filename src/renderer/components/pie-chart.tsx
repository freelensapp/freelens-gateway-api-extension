import { Renderer } from "@freelensapp/extensions";
import { getStatusCategory } from "../api/k8s";
import styles from "./pie-chart.module.scss";
import stylesInline from "./pie-chart.module.scss?inline";

import type React from "react";

const getStats = (objects: Renderer.K8sApi.KubeObject[]): [number, number, number, number] => {
  let ready = 0;
  let notReady = 0;
  let inProgress = 0;
  let unknown = 0;

  for (const object of objects) {
    switch (getStatusCategory(object)) {
      case "Ready":
        ready++;
        break;
      case "NotReady":
        notReady++;
        break;
      case "InProgress":
        inProgress++;
        break;
      default:
        unknown++;
        break;
    }
  }

  return [ready, notReady, inProgress, unknown];
};

const getPath = (crd: Renderer.K8sApi.CustomResourceDefinition): string => {
  return crd.spec.names.singular ?? crd.spec.names.plural;
};

export interface PieChartProps {
  objects: Renderer.K8sApi.KubeObject[];
  title: string;
  crd: Renderer.K8sApi.CustomResourceDefinition;
}

export function PieChart(props: PieChartProps): React.ReactElement {
  const { objects, title, crd } = props;
  const [ready, notReady, inProgress, unknown] = getStats(objects);

  // chart.js typings are not installed in this project, so the host's
  // PieChartData/ChartData types are degraded and reject the real dataset
  // shape. Build the value untyped and cast it to the expected PieChartData
  // type when handing it to the chart component.
  const chartData = {
    datasets: [
      {
        data: [ready, notReady, inProgress, unknown],
        backgroundColor: ["#43a047", "#ce3933", "#FF6600", "#3a3a3c"],
        tooltipLabels: [
          (percent: string) => `Ready: ${percent}`,
          (percent: string) => `Not Ready: ${percent}`,
          (percent: string) => `In Progress: ${percent}`,
          (percent: string) => `Unknown: ${percent}`,
        ],
      },
    ],

    labels: [`Ready: ${ready}`, `Not Ready: ${notReady}`, `In Progress: ${inProgress}`, `Unknown: ${unknown}`],
  };

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.chart}>
        <div className={styles.title}>
          <a
            onClick={(e) => {
              e.preventDefault();
              Renderer.Navigation.navigate({ pathname: getPath(crd) });
            }}
          >
            {title} ({objects.length})
          </a>
        </div>
        <Renderer.Component.PieChart data={chartData as Renderer.Component.PieChartData} />
      </div>
    </>
  );
}
