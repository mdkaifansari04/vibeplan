import { SourceFile } from "ts-morph";
import { FileInfo } from "../controller/type";

interface FileAnalysisResult {
  path: string;
  language: string;
  complexity: number;
  linesOfCode: number;
  detectedIssues: CodeIssue[];
  needsAISummary: boolean;
  priority: "low" | "medium" | "high" | "critical";
  semanticTags: string[];
}

interface CodeIssue {
  type: "security" | "performance" | "maintainability" | "best-practice";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  line?: number;
  category: string;
}

export class FileAnalysisService {
  /**
   * Determines if a file needs AI summary or can use rule-based summary
   */
  shouldGenerateAISummary(file: FileInfo, analysis: any): boolean {
    // Skip files that don't need AI analysis
    if (this.isExcludedFile(file.path)) return false;

    // Generate AI summary for critical files
    return this.isComplexFile(analysis) || this.isSecuritySensitive(file.path) || this.isCoreBusinessLogic(file.path) || this.hasDetectedIssues(analysis);
  }

  /**
   * Files that should be excluded from AI analysis
   */
  private isExcludedFile(path: string): boolean {
    const exclusions = [
      // Test files
      path.includes("test"),
      path.includes("spec"),
      path.includes("__tests__"),

      // Configuration files
      path.endsWith(".json"),
      path.endsWith(".yml"),
      path.endsWith(".yaml"),
      path.endsWith(".config.js"),
      path.endsWith(".config.ts"),

      // Documentation
      path.endsWith(".md"),
      path.endsWith(".txt"),

      // Lock files and dependencies
      path.includes("package-lock.json"),
      path.includes("yarn.lock"),
      path.includes("pnpm-lock.yaml"),

      // Build artifacts
      path.includes("dist/"),
      path.includes("build/"),
      path.includes(".next/"),

      // Simple type definition files
      path.endsWith(".d.ts") && !path.includes("types"),
    ];

    return exclusions.some((condition) => condition);
  }

  /**
   * Check if file is complex enough to warrant AI analysis
   */
  private isComplexFile(analysis: any): boolean {
    return analysis.lines_of_code > 200 || analysis.functions.length > 10 || analysis.classes.length > 3 || this.calculateComplexity(analysis) > 10;
  }

  /**
   * Check if file handles security-sensitive operations
   */
  private isSecuritySensitive(path: string): boolean {
    const sensitivePatterns = ["api/", "auth", "login", "security", "middleware", "guard", "service/", "controller", "route", "handler", "validation"];

    return sensitivePatterns.some((pattern) => path.toLowerCase().includes(pattern.toLowerCase()));
  }

  /**
   * Check if file contains core business logic
   */
  private isCoreBusinessLogic(path: string): boolean {
    const businessLogicPatterns = ["service", "controller", "model", "repository", "manager", "processor", "handler", "engine", "core", "business"];

    return businessLogicPatterns.some((pattern) => path.toLowerCase().includes(pattern.toLowerCase()));
  }

  /**
   * Check if file has detected code issues
   */
  private hasDetectedIssues(analysis: any): boolean {
    // This will be populated by static analysis
    return analysis.detectedIssues && analysis.detectedIssues.length > 0;
  }

  /**
   * Calculate rough complexity score
   */
  private calculateComplexity(analysis: any): number {
    let complexity = 0;

    // Base complexity from structure
    complexity += analysis.functions.length * 2;
    complexity += analysis.classes.length * 3;
    complexity += analysis.imports.length * 0.5;

    // Add complexity for file size
    if (analysis.lines_of_code > 100) complexity += 2;
    if (analysis.lines_of_code > 300) complexity += 3;
    if (analysis.lines_of_code > 500) complexity += 5;

    return Math.round(complexity);
  }

  /**
   * Generate rule-based summary for files that don't need AI
   */
  generateRuleBasedSummary(file: FileInfo, analysis: any): string {
    const path = file.path;
    const lang = file.extension;

    // Configuration files
    if (path.includes("config") || path.endsWith(".json")) {
      return `Configuration file defining ${analysis.exports?.length || 0} settings and options`;
    }

    // Type definition files
    if (path.includes("types") || path.includes("interface")) {
      return `Type definitions providing ${analysis.exports?.length || 0} interfaces and type declarations`;
    }

    // React components
    if (lang === ".tsx" && analysis.exports?.length > 0) {
      return `React component: ${analysis.exports[0]} with ${analysis.functions?.length || 0} methods and ${analysis.classes?.length || 0} classes`;
    }

    // API routes
    if (path.includes("api/") && (path.includes("route") || path.includes("handler"))) {
      const methods = this.extractApiMethods(analysis);
      return `API endpoint handling ${methods.length > 0 ? methods.join(", ") : "HTTP"} requests with ${analysis.functions?.length || 0} handlers`;
    }

    // Service files
    if (path.includes("service")) {
      return `Service layer providing ${analysis.functions?.length || 0} business operations and ${analysis.classes?.length || 0} service classes`;
    }

    // Utility files
    if (path.includes("util") || path.includes("helper")) {
      return `Utility module with ${analysis.functions?.length || 0} helper functions and ${analysis.exports?.length || 0} exports`;
    }

    // Database/Model files
    if (path.includes("model") || path.includes("schema") || path.includes("database")) {
      return `Data layer defining ${analysis.classes?.length || 0} models and ${analysis.functions?.length || 0} database operations`;
    }

    // Middleware
    if (path.includes("middleware")) {
      return `Middleware module with ${analysis.functions?.length || 0} middleware functions for request processing`;
    }

    // Test files
    if (path.includes("test") || path.includes("spec")) {
      return `Test suite with ${analysis.functions?.length || 0} test cases for validation and quality assurance`;
    }

    // Generic fallback based on file content
    const parts = [];
    if (analysis.functions?.length > 0) {
      parts.push(`${analysis.functions.length} functions`);
    }
    if (analysis.classes?.length > 0) {
      parts.push(`${analysis.classes.length} classes`);
    }
    if (analysis.exports?.length > 0) {
      parts.push(`${analysis.exports.length} exports`);
    }

    if (parts.length === 0) {
      return `${this.getLanguageName(lang)} file containing basic code structure and definitions`;
    }

    return `${this.getLanguageName(lang)} module containing ${parts.join(", ")}`;
  }

  /**
   * Extract HTTP methods from API analysis
   */
  private extractApiMethods(analysis: any): string[] {
    const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
    const found = [];

    if (analysis.functions) {
      for (const func of analysis.functions) {
        const funcName = func.name || func;
        const upperName = funcName.toUpperCase();

        for (const method of methods) {
          if (upperName.includes(method) || funcName === method.toLowerCase()) {
            found.push(method);
          }
        }
      }
    }

    return [...new Set(found)]; // Remove duplicates
  }

  /**
   * Get human-readable language name
   */
  private getLanguageName(extension: string): string {
    const languageMap: Record<string, string> = {
      ".ts": "TypeScript",
      ".tsx": "TypeScript React",
      ".js": "JavaScript",
      ".jsx": "JavaScript React",
      ".py": "Python",
      ".java": "Java",
      ".go": "Go",
      ".rb": "Ruby",
      ".php": "PHP",
      ".cpp": "C++",
      ".c": "C",
      ".cs": "C#",
      ".swift": "Swift",
      ".kt": "Kotlin",
      ".rs": "Rust",
      ".dart": "Dart",
      ".scala": "Scala",
    };
    return languageMap[extension] || "Code";
  }

  /**
   * Detect code issues through static analysis
   */
  detectCodeIssues(content: string, path: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Security issues
    if (content.includes("eval(") || content.includes("Function(")) {
      issues.push({
        type: "security",
        severity: "critical",
        description: "Use of eval() or Function() can lead to code injection vulnerabilities",
        category: "dangerous-function",
      });
    }

    if (content.match(/password\s*=\s*['"][^'"]+['"]/i)) {
      issues.push({
        type: "security",
        severity: "critical",
        description: "Hardcoded password detected in source code",
        category: "hardcoded-credentials",
      });
    }

    if (content.match(/api[_-]?key\s*=\s*['"][^'"]+['"]/i)) {
      issues.push({
        type: "security",
        severity: "high",
        description: "Hardcoded API key detected in source code",
        category: "hardcoded-credentials",
      });
    }

    // SQL injection risks
    if ((content.includes("SELECT") || content.includes("INSERT") || content.includes("UPDATE")) && (content.includes("${") || content.includes('" + ') || content.includes("' + "))) {
      issues.push({
        type: "security",
        severity: "high",
        description: "Potential SQL injection vulnerability - use parameterized queries",
        category: "sql-injection-risk",
      });
    }

    // Performance issues
    if (content.includes("for (") && content.includes("await ") && !content.includes("Promise.all")) {
      issues.push({
        type: "performance",
        severity: "medium",
        description: "Sequential async operations in loop - consider Promise.all for parallel execution",
        category: "async-performance",
      });
    }

    // Best practices
    if (!content.includes("try") && !content.includes("catch") && (content.includes("async ") || content.includes("await "))) {
      issues.push({
        type: "best-practice",
        severity: "medium",
        description: "Missing error handling for async operations",
        category: "missing-error-handling",
      });
    }

    if (content.includes("console.log") && !path.includes("dev") && !path.includes("debug")) {
      issues.push({
        type: "maintainability",
        severity: "low",
        description: "Console.log statements should be removed from production code",
        category: "debug-code",
      });
    }

    // TODO/FIXME comments
    if (content.match(/\/\/\s*(TODO|FIXME|XXX|HACK)/i)) {
      issues.push({
        type: "maintainability",
        severity: "low",
        description: "Code contains TODO/FIXME comments indicating incomplete work",
        category: "incomplete-work",
      });
    }

    return issues;
  }

  /**
   * Generate semantic tags for better search
   */
  generateSemanticTags(path: string, analysis: any, content: string): string[] {
    const tags = new Set<string>();

    // Language tag
    tags.add(analysis.language);

    // File type tags
    if (path.includes("api/")) tags.add("api");
    if (path.includes("component")) tags.add("component");
    if (path.includes("service")) tags.add("service");
    if (path.includes("model")) tags.add("model");
    if (path.includes("util")) tags.add("utility");
    if (path.includes("middleware")) tags.add("middleware");
    if (path.includes("auth")) tags.add("authentication");
    if (path.includes("database") || path.includes("db")) tags.add("database");

    // Technology tags based on imports
    if (analysis.imports) {
      for (const imp of analysis.imports) {
        if (imp.includes("react")) tags.add("react");
        if (imp.includes("express")) tags.add("express");
        if (imp.includes("next")) tags.add("nextjs");
        if (imp.includes("prisma")) tags.add("prisma");
        if (imp.includes("mongoose")) tags.add("mongodb");
        if (imp.includes("redis")) tags.add("redis");
        if (imp.includes("jwt")) tags.add("jwt");
        if (imp.includes("bcrypt")) tags.add("encryption");
      }
    }

    // Content-based tags
    if (content.includes("SELECT") || content.includes("INSERT")) tags.add("sql");
    if (content.includes("fetch(") || content.includes("axios")) tags.add("http-client");
    if (content.includes("router") || content.includes("app.get")) tags.add("routing");
    if (content.includes("auth") || content.includes("login")) tags.add("authentication");
    if (content.includes("validate") || content.includes("schema")) tags.add("validation");
    if (content.includes("cache") || content.includes("redis")) tags.add("caching");
    if (content.includes("queue") || content.includes("job")) tags.add("background-jobs");

    return Array.from(tags);
  }
}

export default new FileAnalysisService();
