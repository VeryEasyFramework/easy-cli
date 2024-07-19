export async function runCommand(command: string, args?: string[], options?: {
  cwd?: string;
  env?: Record<string, string>;
}) {
  const cmd = new Deno.Command(command, {
    args: args,
    stdout: "piped",
    stderr: "piped",
    cwd: options?.cwd,
    env: options?.env,
  });

  let stdout = "";
  let stderr = "";

  const process = cmd.spawn();
  const decoder = new TextDecoder();

  const stdStream = new WritableStream({
    write(chunk) {
      const chunkStr = decoder.decode(chunk);
      stdout += chunkStr;
      console.log(chunkStr);
    },
  });

  const errStream = new WritableStream({
    write(chunk) {
      const chunkStr = decoder.decode(chunk);
      stderr += chunkStr;
      console.log(chunkStr);
    },
  });
  process.stdout.pipeTo(stdStream);
  process.stderr.pipeTo(errStream);
  const status = await process.status;

  console.log(`Exited with code ${status.code}`);

  return { stdout, stderr, status };
}
