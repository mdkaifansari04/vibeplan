import type { Response, NextFunction } from "express";

import { CustomRequest } from "../../../types";
import { VectorService } from "../services/vector.service";
import { PhaseGeneratorService } from "../services/phase-generator.service";
import { PhaseGenerationRequest } from "../services/types";
import ErrorResponse from "../../../middleware/error-response";
import { logger } from "../../../libs/logger";

class PhaseGenerationController {
  private vectorService: VectorService;
  private phaseGenerator: PhaseGeneratorService;

  constructor() {
    this.vectorService = new VectorService();
    this.phaseGenerator = new PhaseGeneratorService();
  }

  public generatePhases = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const { namespace, userPrompt, contextType }: PhaseGenerationRequest = req.value;

      if (!namespace || !userPrompt) {
        return res.status(400).json({
          success: false,
          message: "Both 'namespace' and 'userPrompt' are required",
        });
      }

      console.log(`Generating phases for namespace: ${namespace}`);
      console.log(`User prompt: "${userPrompt}"`);

      // Step 1: Analyze user prompt and classify intent
      const promptAnalysis = await this.phaseGenerator.analyzeUserPrompt(userPrompt);
      console.log(`Prompt analysis completed:`, promptAnalysis);

      // Step 2: Retrieve relevant context from Pinecone
      console.log(`Retrieving relevant context for query type: ${promptAnalysis.queryType}`);
      const relevantContext = await this.vectorService.findRelevantContext(namespace, userPrompt, contextType || promptAnalysis.queryType);

      console.log(`Found ${relevantContext.files.length} relevant files`);

      // Step 3: Generate atomic phases using the phase generator
      const phases = await this.phaseGenerator.generateAtomicPhases(userPrompt, relevantContext, promptAnalysis);

      console.log(`Generated ${phases.length} atomic phases`);

      // Step 4: Prepare response data
      const responseData = {
        namespace,
        userPrompt,
        prompt_analysis: promptAnalysis,
        phases,
        total_phases: phases.length,
        context_files_used: relevantContext.totalFilesFound,
        context_summary: {
          total_files_found: relevantContext.totalFilesFound,
          languages_found: [...new Set(relevantContext.files.map((f) => f.language).filter(Boolean))],
          file_types: [
            ...new Set(
              relevantContext.files.map((f) => {
                const ext = f.path.split(".").pop();
                return ext || "unknown";
              })
            ),
          ],
          top_relevant_files: relevantContext.files.slice(0, 5).map((f) => ({
            path: f.path,
            language: f.language,
            similarity: Math.round((f.similarity || 0) * 100) / 100,
          })),
        },
      };

      res.json({
        success: true,
        data: responseData,
        message: `Successfully generated ${phases.length} atomic phases`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(new ErrorResponse(`Phase generation failed : ${error}`, 500));
      logger.error(`Phase generation failed : ${error}`);
    }
  };

  public analyzePrompt = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const { userPrompt }: { userPrompt: string } = req.value;

      if (!userPrompt) {
        return res.status(400).json({
          success: false,
          message: "Field 'userPrompt' is required",
        });
      }

      console.log(`Analyzing prompt: "${userPrompt}"`);

      // Analyze the prompt without context
      const promptAnalysis = await this.phaseGenerator.analyzeUserPrompt(userPrompt);

      res.json({
        success: true,
        data: {
          userPrompt,
          analysis: promptAnalysis,
        },
        message: "Prompt analysis completed",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Prompt analysis error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to analyze prompt",
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      });
    }
  };

  public getContextPreview = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const { namespace, userPrompt, contextType }: PhaseGenerationRequest = req.value;

      if (!namespace || !userPrompt) {
        return res.status(400).json({
          success: false,
          message: "Both 'namespace' and 'userPrompt' are required",
        });
      }

      console.log(`Getting context preview for namespace: ${namespace}`);

      // Get context without generating phases
      const relevantContext = await this.vectorService.findRelevantContext(namespace, userPrompt, contextType || "improvement");

      const contextPreview = {
        namespace,
        userPrompt,
        context_summary: {
          total_files_found: relevantContext.totalFilesFound,
          languages_found: [...new Set(relevantContext.files.map((f) => f.language).filter(Boolean))],
          file_types: [
            ...new Set(
              relevantContext.files.map((f) => {
                const ext = f.path.split(".").pop();
                return ext || "unknown";
              })
            ),
          ],
          relevant_files: relevantContext.files.map((f) => ({
            path: f.path,
            language: f.language,
            description: f.description,
            similarity: Math.round((f.similarity || 0) * 100) / 100,
            content_preview: f.content.slice(0, 200) + "...",
          })),
        },
        dependency_info: relevantContext.dependencyInfo,
        repo_structure: relevantContext.repoStructure,
      };

      res.json({
        success: true,
        data: contextPreview,
        message: "Context preview retrieved successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Context preview error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to get context preview",
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      });
    }
  };
}

export default new PhaseGenerationController();
