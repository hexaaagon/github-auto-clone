const fs = require("fs");
const promosifyChild = require("child-process-promise");
const child = require("child_process");
const kill = require("tree-kill");

const { QuickDB, JSONDriver } = require("quick.db");
const jsonDriver = new JSONDriver("data.json");
const db = new QuickDB({ driver: jsonDriver });

const configType = require("./config.js").config;
/** @type {import("./config.js")} */
const config = configType === "local" ? require("./config.js") : process.env;

const { Octokit } = require("@octokit/core");
const octo = new Octokit({
  auth: config.token || undefined,
});

const EventEmitter = require("events");
const event = new EventEmitter();

start();

async function start() {
  console.log("starting");
  const cron = require("node-cron");

  const nodeCommand = config.startupCommands;

  const node = child.spawn(nodeCommand, [], {
    stdio: "inherit",
    shell: true,
    cwd: "data",
  });

  await db.set("proc", node);

  check();

  cron.schedule(config.cron, () => {
    check();
  });
}

async function check() {
  console.log("checking");
  if (!fs.existsSync("./data"))
    return update({ notExists: true, notLatestCommit: true });

  const latestCommit = (await db.get("latest")) || null;
  if (!latestCommit) return update({ notLatestCommit: true });

  const req = await octo.request(
    `GET /repos${
      config.repo.startsWith("/")
        ? config.repo.endsWith("/")
          ? config.repo
          : `${config.repo}/`
        : config.repo.endsWith("/")
        ? `/${config.repo}`
        : `/${config.repo}/`
    }commits`
  );

  if (req.data[0].sha !== latestCommit) return update();

  console.log("no updates");
}

/**
 * @param {{ notExists?: boolean, notLatestCommit?: boolean }} options
 */
async function update(options) {
  console.log("updating");
  if (!options?.notLatestCommit) {
    const proc = await db.get("proc");

    if (proc) {
      const pid = proc.pid;
      event.emit(`proc-${pid}`);
      kill(pid, "SIGKILL");
    }
    await db.delete("proc");
  }
  if (!options?.notExists)
    fs.rmSync("./data", { recursive: true, force: true });

  fs.mkdirSync("./data");

  const gitCommand = `git clone ${
    config.token ? `https://${config.token}@github.com` : `https://github.com`
  }${
    config.repo.startsWith("/")
      ? config.repo.endsWith("/")
        ? config.repo.split("").splice(-1).join("")
        : config.repo
      : config.repo.endsWith("/")
      ? `/${config.repo.split("").splice(-1).join("")}`
      : `/${config.repo}`
  }.git .`;

  const git = await promosifyChild.spawn(gitCommand, [], {
    stdio: "inherit",
    shell: true,
    cwd: "data",
  });

  const req = await octo.request(
    `GET /repos${
      config.repo.startsWith("/")
        ? config.repo.endsWith("/")
          ? config.repo
          : `${config.repo}/`
        : config.repo.endsWith("/")
        ? `/${config.repo}`
        : `/${config.repo}/`
    }commits`
  );

  await db.set("latest", req.data[0].sha);

  const buildCommands = config.buildCommands;
  const build = await promosifyChild.spawn(buildCommands, [], {
    stdio: "inherit",
    shell: true,
    cwd: "data",
  });

  const nodeCommand = config.startupCommands;

  const node = child.spawn(nodeCommand, [], {
    stdio: "inherit",
    shell: true,
    cwd: "data",
  });

  await db.set("proc", node);
  console.log("done updating", node.pid);

  event.once(`proc-${node.pid}}`, () => {
    node.kill("SIGKILL");
  });
}
