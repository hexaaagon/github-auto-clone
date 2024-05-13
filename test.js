const { spawn } = require("child_process");

const fs = require("fs");
if (fs.existsSync("./data"))
  fs.rmSync("./data", { recursive: true, force: true });

fs.mkdirSync("./data");

// Define the shell command to execute
const command = "git clone https://github.com/scoooolzs/hello-world.git .";

// Execute the shell command
const child = spawn(command, [], {
  stdio: "inherit",
  shell: true,
  cwd: "data",
});

const child1 = spawn("npm i && node .", [], {
  stdio: "inherit",
  shell: true,
  cwd: "data",
});

child.on("error", (err) => {
  console.error("Error:", err);
});

child1.on("error", (err) => {
  console.error("Error:", err);
});
