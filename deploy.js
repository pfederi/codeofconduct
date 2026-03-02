const ftp = require("basic-ftp");
const path = require("path");
const config = require("./.ftpconfig.json");

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  
  try {
    console.log("🚀 Starting FTP deployment...");
    
    await client.access({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port,
      secure: true
    });

    console.log("✅ Connected to FTP server");
    console.log("📂 Uploading files to /coc directory...");
    
    // Ensure the remote directory exists
    try {
      await client.ensureDir("/coc");
    } catch {
      await client.mkdir("/coc");
    }
    
    await client.uploadFromDir(path.join(process.cwd(), "dist"), "/coc");
    
    console.log("✅ FTP deployment completed successfully!");
  } catch (err) {
    console.error("❌ FTP deployment failed:", err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy(); 