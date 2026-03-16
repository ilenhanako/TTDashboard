import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { writeFile, mkdir, rm, unlink, copyFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { existsSync } from "fs";

// Paths
const PROJECT_ROOT = process.cwd();
const STREAMLIT_PATH = join(PROJECT_ROOT, "..", "streamlit_app");
const DATA_PROCESSING_PATH = join(PROJECT_ROOT, "..", "data_processing");
const OUTPUT_DATA_PATH = join(PROJECT_ROOT, "public", "data");

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

    // Create temp directory for uploaded files
    const tempDir = join(tmpdir(), `daly-upload-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    // Ensure output directory exists
    await mkdir(OUTPUT_DATA_PATH, { recursive: true });

    const processedFiles: string[] = [];
    const errors: string[] = [];

    try {
      // Save uploaded files to temp directory
      const countryPaths: string[] = [];
      for (const file of countryFiles) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = join(tempDir, file.name);
        await writeFile(filePath, buffer);
        countryPaths.push(filePath);
        processedFiles.push(file.name);
      }

      let globalPath: string | null = null;
      if (globalFile) {
        const buffer = Buffer.from(await globalFile.arrayBuffer());
        globalPath = join(tempDir, globalFile.name);
        await writeFile(globalPath, buffer);
        processedFiles.push(globalFile.name);
      }

      // Generate dashboard data using Python
      const result = await generateDashboardData(countryPaths, globalPath, OUTPUT_DATA_PATH);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to process files" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: `Successfully processed ${processedFiles.length} file(s): ${processedFiles.join(", ")}. Years: ${result.years?.join(", ") || "unknown"}`,
        processedFiles,
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
      { error: `Failed to process upload: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

async function generateDashboardData(
  countryFiles: string[],
  globalFile: string | null,
  outputPath: string
): Promise<{ success: boolean; years?: string[]; error?: string }> {
  return new Promise((resolve) => {
    const countryFilesJson = JSON.stringify(countryFiles);
    const globalFileStr = globalFile ? `"${globalFile}"` : "None";

    const pythonCode = `
import sys
import json
sys.path.insert(0, '${STREAMLIT_PATH}')

try:
    from processing import DashboardDataGenerator

    # Initialize generator with output path
    generator = DashboardDataGenerator('${outputPath}', load_existing=True)

    # Process country files
    country_files = json.loads('${countryFilesJson}')
    years_processed = []

    for file_path in country_files:
        try:
            data = generator.process_country_file(file_path)
            year = data.get('year', 'unknown')
            years_processed.append(year)
            print(f"Processed country file for year: {year}", file=sys.stderr)
        except Exception as e:
            print(f"Error processing {file_path}: {e}", file=sys.stderr)

    # Process global file if provided
    global_file = ${globalFileStr}
    if global_file:
        try:
            generator.process_global_file(global_file)
            print("Processed global file", file=sys.stderr)
        except Exception as e:
            print(f"Error processing global file: {e}", file=sys.stderr)

    # Save the data
    output_file = generator.save()
    print(f"Saved to: {output_file}", file=sys.stderr)

    # Output result as JSON
    print(json.dumps({
        "success": True,
        "years": years_processed,
        "output": str(output_file)
    }))

except Exception as e:
    import traceback
    traceback.print_exc(file=sys.stderr)
    print(json.dumps({
        "success": False,
        "error": str(e)
    }))
    sys.exit(1)
`;

    const python = spawn("python3", ["-c", pythonCode]);
    let stdout = "";
    let stderr = "";

    python.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    python.stderr.on("data", (data) => {
      stderr += data.toString();
      console.log("Python stderr:", data.toString());
    });

    python.on("close", (code) => {
      console.log("Python exit code:", code);
      console.log("Python stdout:", stdout);
      console.log("Python stderr:", stderr);

      try {
        // Find the JSON output in stdout (last line)
        const lines = stdout.trim().split("\n");
        const jsonLine = lines[lines.length - 1];
        const result = JSON.parse(jsonLine);

        if (result.success) {
          resolve({ success: true, years: result.years });
        } else {
          resolve({ success: false, error: result.error || stderr });
        }
      } catch (e) {
        resolve({
          success: false,
          error: `Failed to parse Python output: ${stderr || stdout || "No output"}`
        });
      }
    });

    python.on("error", (err) => {
      resolve({ success: false, error: err.message });
    });
  });
}

// DELETE endpoint for removing uploaded data
export async function DELETE() {
  try {
    const dataFile = join(OUTPUT_DATA_PATH, "dashboard_data.json");

    if (existsSync(dataFile)) {
      await unlink(dataFile);
      return NextResponse.json({
        message: "Dashboard data deleted successfully"
      });
    }

    return NextResponse.json({ message: "No data to delete" });

  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: `Failed to delete data: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
