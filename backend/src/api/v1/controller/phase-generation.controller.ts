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

      const promptAnalysis = await this.phaseGenerator.analyzeUserPrompt(userPrompt);
      console.log(`Prompt analysis completed:`, promptAnalysis);

      console.log(`Retrieving relevant context for query type: ${promptAnalysis.queryType}`);
      const relevantContext = await this.vectorService.findRelevantContext(namespace, userPrompt, contextType || promptAnalysis.queryType);

      console.log(`Found ${relevantContext.files.length} relevant files`);

      const phases = await this.phaseGenerator.generateAtomicPhases(userPrompt, relevantContext, promptAnalysis);

      console.log(`Generated ${phases.length} atomic phases`);

      const responseData = {
        namespace,
        userPrompt,
        promptAnalysis: promptAnalysis,
        phases,
        totalPhases: phases.length,
        contextFilesUsed: relevantContext.totalFilesFound,
        contextSummary: {
          totalFilesFound: relevantContext.totalFilesFound,
          languagesFound: [...new Set(relevantContext.files.map((f) => f.language).filter(Boolean))],
          fileTypes: [
            ...new Set(
              relevantContext.files.map((f) => {
                const ext = f.path.split(".").pop();
                return ext || "unknown";
              })
            ),
          ],
          topRelevantFiles: relevantContext.files.slice(0, 5).map((f) => ({
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
}

export default new PhaseGenerationController();
