import Docker from "dockerode";
import getPort from "get-port";
import { Pool } from "pg";

const desiredPgPort = 5432;

async function main() {
  const docker = new Docker();
  const port = await getPort({ port: desiredPgPort });
  if (desiredPgPort !== port) {
    throw new Error(`${desiredPgPort} port is taken`);
  }
  const image = "postgres";

  await docker.pull(image);

  const pgContainer = await docker.createContainer({
    Image: image,
    Env: [
      "POSTGRES_PASSWORD=postgres",
      "POSTGRES_USER=postgres",
      "POSTGRES_DB=postgres",
    ],
    name: `benchmarks-pg`,
    HostConfig: {
      AutoRemove: true,
      PortBindings: {
        "5432/tcp": [{ HostPort: `${port}` }],
      },
    },
  });

  await pgContainer.start();

  let sleep = 250;
  let timeLeft = 5000;
  let connected = false;
  let lastError: unknown | undefined;

  const dburl = `postgres://postgres:postgres@localhost:${port}/postgres`;
  const pool = new Pool({ connectionString: dburl });

  do {
    try {
      await pool.connect();
      connected = true;
      break;
    } catch (e) {
      lastError = e;
      await new Promise((resolve) => setTimeout(resolve, sleep));
      timeLeft -= sleep;
    }
  } while (timeLeft > 0);
  if (!connected) {
    console.error("Cannot connect to Postgres");
    throw lastError;
  }
  // const sql_script = fs.readFileSync(path.resolve("data/init-db.sql"), "utf-8");
  // await pool.query(sql_script);
  console.log("db is up and running...");
  process.exit(0);
}

main();
