import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { writeFile, mkdir, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const countryFiles = formData.getAll("countryFiles") as File[];
    const globalFile = formData.get("globalFile") as File | null;

    if (countryFiles.length === 0 && !globalFile) {
      return NextResponse.json(
        { error: "No files uploaded" },
        { status: 400 }
      );
    }

    // Create a temporary directory for uploaded files
    const tempDir = join(tmpdir(), `daly-upload-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    const countryPaths: string[] = [];
    let globalPath: string | null = null;

    try {
      // Save country files
      for (const file of countryFiles) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = join(tempDir, file.name);
        await writeFile(filePath, buffer);
        countryPaths.push(filePath);
      }

      // Save global file
      if (globalFile) {
        const buffer = Buffer.from(await globalFile.arrayBuffer());
        globalPath = join(tempDir, globalFile.name);
        await writeFile(globalPath, buffer);
      }

      // Determine paths
      const projectRoot = process.cwd();
      const streamlitPath = join(projectRoot, "..", "streamlit_app");
      const outputPath = join(projectRoot, "public", "data");

      // Create output directory if it doesn't exist
      await mkdir(outputPath, { recursive: true });

      // Check if the Python processing script exists
      const processingScriptPath = join(streamlitPath, "processing", "generator.py");

      if (!existsSync(processingScriptPath)) {
        // If Python processing is not available, return a message
        return NextResponse.json(
          {
            error: "File processing not available. Please use the Streamlit app for file processing, or ensure the processing module is available.",
            countryFiles: countryPaths.map(p => p.split("/").pop()),
            globalFile: globalPath ? globalPath.split("/").pop() : null,
          },
          { status: 501 }
        );
      }

      // Build the Python command
      const pythonArgs = [
        "-c",
        `
import sys
sys.path.insert(0, '${streamlitPath}')
from processing import DashboardDataGenerator
import json

generator = DashboardDataGenerator('${outputPath}')

country_files = ${JSON.stringify(countryPaths)}
global_file = ${globalPath ? `'${globalPath}'` : 'None'}

years_processed = []
for path in country_files:
    data = generator.process_country_file(path)
    years_processed.append(data.get('year', 'unknown'))

if global_file:
    generator.process_global_file(global_file)

output_path = generator.save()
print(json.dumps({'success': True, 'years': years_processed, 'output': output_path}))
`
      ];

      // Execute Python processing
      const result = await new Promise<{ success: boolean; years?: string[]; error?: string }>((resolve) => {
        const python = spawn("python3", pythonArgs);
        let stdout = "";
        let stderr = "";

        python.stdout.on("data", (data) => {
          stdout += data.toString();
        });

        python.stderr.on("data", (data) => {
          stderr += data.toString();
        });

        python.on("close", (code) => {
          if (code === 0) {
            try {
              const output = JSON.parse(stdout.trim());
              resolve(output);
            } catch {
              resolve({ success: true, years: [] });
            }
          } else {
            resolve({ success: false, error: stderr || "Processing failed" });
          }
        });

        python.on("error", (err) => {
          resolve({ success: false, error: err.message });
        });
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to process files" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: `Successfully processed ${countryFiles.length} country file(s) for years: ${result.years?.join(", ") || "unknown"}`,
        years: result.years,
      });

    } finally {
      // Clean up temp directory
      try {
        await rm(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
