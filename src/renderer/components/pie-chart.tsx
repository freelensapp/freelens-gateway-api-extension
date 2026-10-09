import { Renderer } from "@freelensapp/extensions";
import { getStatusCategory } from "../api/k8s";
import styles from "./pie-chart.module.scss";

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

export interface PieChartProps {
  objects: Renderer.K8sApi.KubeObject[];
  title: string;
  onTitleClick: () => void;
}

export function PieChart(props: PieChartProps): React.ReactElement {
  const { objects, title, onTitleClick } = props;
  const [ready, notReady, inProgress, unknown] = getStats(objects);

  const chartData: Renderer.Component.PieChartData = {
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
    <div className={styles.chart}>
      <div className={styles.title}>
        <a
          onClick={(e) => {
            e.preventDefault();
            onTitleClick();
          }}
        >
          {title} ({objects.length})
        </a>
      </div>
      <Renderer.Component.PieChart data={chartData} />
    </div>
  );
}
