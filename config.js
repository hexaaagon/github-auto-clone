// @ts-check

module.exports = {
  /**
   * @description Choose the config file. Use this 'config.js' or use .env file.
   *
   * @type {"local" | "env"}
   */
  config: "local",

  /**
   * ########## NOTE ##########
   * The configuration below will not work if you set the
   * "config" variable as "env".
   *
   * Please change the variable to "local" if you want to
   * use this file as your main configuration file.
   * ########## NOTE ##########
   */

  /**
   * @description Git Token. Use this if the repository is private.
   *
   * @type {string | null}
   */
  token: "",

  /**
   * @description Repository name with the owner.
   * @example hexaaagon/auto-clone-github
   *
   * @type {string}
   */
  repo: "",

  /**
   * @description Build commands you like. Unlike startupCommands, startupCommands can be runned if this commands done.
   */
  buildCommands: "npm i",

  /**
   * @description The start up commands you like.
   */
  startupCommands: "node index",

  /**
   * @description How many times the repository is checked using cron. Use https://crontab.guru/ for easier. (Recommended above every 5 minutes)
   */
  cron: "*/1 * * * *",

  /**
   * @description Log every this script doing.
   *
   * @type {"true" | "false"}
   */
  log: "true",

  /**
   * @
   */
};
