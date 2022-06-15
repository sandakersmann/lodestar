// Set up Chai
import path from "node:path";
import {fileURLToPath} from "node:url";
import fs from "node:fs";
import chai from "chai";

const expect = chai.expect;
// import chaiORV from "chai-openapi-response-validator";
import {createIBeaconConfig, IChainConfig} from "@chainsafe/lodestar-config";
import {chainConfig as chainConfigDef} from "@chainsafe/lodestar-config/default";
import {getClient} from "@chainsafe/lodestar-api";
import {toHexString} from "@chainsafe/ssz";
import {ssz} from "@chainsafe/lodestar-types";
import {LogLevel, testLogger, TestLoggerOpts} from "../../utils/logger.js";
import {getDevBeaconNode} from "../../utils/node/beacon.js";
import {isValidResponse} from "./util/api_response_validator.js";

/* eslint-disable @typescript-eslint/naming-convention */
const SECONDS_PER_SLOT = 2;
const ALTAIR_FORK_EPOCH = 0;
const restPort = 9596;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const chainConfig: IChainConfig = {...chainConfigDef, SECONDS_PER_SLOT, ALTAIR_FORK_EPOCH};
const genesisValidatorsRoot = Buffer.alloc(32, 0xaa);
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
const config = createIBeaconConfig(chainConfig, genesisValidatorsRoot);
const testLoggerOpts: TestLoggerOpts = {logLevel: LogLevel.info};
const loggerNodeA = testLogger("Node-A", testLoggerOpts);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPEC_FILE: Record<string, unknown> = (JSON.parse(
  fs.readFileSync(path.join(__dirname, "beacon-node-oapi-v2-1-0.json"), {
    encoding: "utf8",
  })
) as unknown) as Record<string, unknown>;

const testParams: Pick<IChainConfig, "SECONDS_PER_SLOT"> = {
  SECONDS_PER_SLOT: 2,
};

const bn = await getDevBeaconNode({
  params: testParams,
  options: {
    sync: {isSingleNode: true},
    api: {rest: {enabled: true, port: restPort}},
  },
  logger: loggerNodeA,
});

// TODOS
// Consider the style of expressing test cases in json and loop to test

describe("beacon api conformance test", function () {
  const afterEachCallbacks: (() => Promise<unknown> | void)[] = [];
  afterEachCallbacks.push(() => bn.close());
  after(async () => {
    while (afterEachCallbacks.length > 0) {
      const callback = afterEachCallbacks.pop();
      if (callback) await callback();
    }
  });

  describe("beacon", function () {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    const client = getClient({baseUrl: `http://127.0.0.1:${restPort}`}, {config}).beacon;

    it("/eth/v1/beacon/genesis - 200", async function () {
      this.timeout("10 min");
      const path = "/eth/v1/beacon/genesis";

      const response = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
        data: ssz.phase0.Genesis.toJson((await client.getGenesis()).data),
      };

      const validatorResponse = isValidResponse(response, SPEC_FILE, {
        path,
        method: "get",
        status: 200,
      });

      expect(validatorResponse.isValid, `validating response for path: ${path} failed)}`).to.be.true;
    });
    it("/eth/v1/beacon/states/head/root - 200 response", async function () {
      const path = "/eth/v1/beacon/states/{state_id}/root";
      const response = {
        data: {
          root: toHexString((await client.getStateRoot("head")).data.root),
        },
      };

      const validatorResponse = isValidResponse(response, SPEC_FILE, {
        path,
        method: "get",
        status: 200,
      });

      expect(validatorResponse.isValid, `validating response for path: ${path} failed)}`).to.be.true;
    });
  });
});
