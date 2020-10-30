import {defaultOptions, IBeaconNodeOptions} from "@chainsafe/lodestar";
import {ICliCommandOptions} from "../../util";

export interface IMetricsArgs {
  "metrics.enabled": boolean;
  "metrics.gatewayUrl": string;
  "metrics.pushGateway": boolean;
  "metrics.serverPort": number;
  "metrics.timeout": number;
}

export function parseArgs(args: IMetricsArgs): IBeaconNodeOptions["metrics"] {
  return {
    enabled: args["metrics.enabled"],
    gatewayUrl: args["metrics.gatewayUrl"],
    pushGateway: args["metrics.pushGateway"],
    serverPort: args["metrics.serverPort"],
    timeout: args["metrics.timeout"],
  };
}

export const options: ICliCommandOptions<IMetricsArgs> = {
  "metrics.enabled": {
    type: "boolean",
    description: "Enable metrics",
    defaultDescription: String(defaultOptions.metrics.enabled),
    group: "metrics",
  },

  "metrics.gatewayUrl": {
    type: "string",
    description: "Gateway URL for metrics",
    defaultDescription: defaultOptions.metrics.gatewayUrl || "",
    group: "metrics",
  },

  "metrics.pushGateway": {
    type: "boolean",
    description: "Enable/disable Prometheus Pushgateway for metrics",
    defaultDescription: String(defaultOptions.metrics.pushGateway),
    group: "metrics",
  },

  "metrics.serverPort": {
    type: "number",
    description: "Server port for metrics",
    defaultDescription: String(defaultOptions.metrics.serverPort),
    group: "metrics",
  },

  "metrics.timeout": {
    type: "number",
    description: "How often metrics should be probed",
    defaultDescription: String(defaultOptions.metrics.timeout),
    group: "metrics",
  },
};
