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
  shouldGenerateAISummary(file: FileInfo, analysis: any): boolean {
    if (this.isExcludedFile(file.path)) return false;

    return this.isComplexFile(analysis) || this.isSecuritySensitive(file.path) || this.isCoreBusinessLogic(file.path) || this.hasDetectedIssues(analysis);
  }

  private isExcludedFile(path: string): boolean {
    const exclusions = [
      path.includes("test"),
      path.includes("spec"),
      path.includes("__tests__"),

      // Configuration files
      path.endsWith(".json"),
      path.endsWith(".yml"),
      path.endsWith(".yaml"),
      path.endsWith(".config.js"),
      path.endsWith(".config.ts"),

      //
      path.endsWith(".md"),
      path.endsWith(".txt"),

      path.includes("package-lock.json"),
      path.includes("yarn.lock"),
      path.includes("pnpm-lock.yaml"),

      path.includes("dist/"),
      path.includes("build/"),
      path.includes(".next/"),

      path.endsWith(".d.ts") && !path.includes("types"),
    ];

    return exclusions.some((condition) => condition);
  }

  private isComplexFile(analysis: any): boolean {
    return analysis.lines_of_code > 200 || analysis.functions.length > 10 || analysis.classes.length > 3 || this.calculateComplexity(analysis) > 10;
  }

  private isSecuritySensitive(path: string): boolean {
    const sensitivePatterns = ["api/", "auth", "login", "security", "middleware", "guard", "service/", "controller", "route", "handler", "validation"];

    return sensitivePatterns.some((pattern) => path.toLowerCase().includes(pattern.toLowerCase()));
  }

  private isCoreBusinessLogic(path: string): boolean {
    const businessLogicPatterns = ["service", "controller", "model", "repository", "manager", "processor", "handler", "engine", "core", "business"];

    return businessLogicPatterns.some((pattern) => path.toLowerCase().includes(pattern.toLowerCase()));
  }

  private hasDetectedIssues(analysis: any): boolean {
    return analysis.detectedIssues && analysis.detectedIssues.length > 0;
  }

  private calculateComplexity(analysis: any): number {
    let complexity = 0;

    complexity += analysis.functions.length * 2;
    complexity += analysis.classes.length * 3;
    complexity += analysis.imports.length * 0.5;

    if (analysis.lines_of_code > 100) complexity += 2;
    if (analysis.lines_of_code > 300) complexity += 3;
    if (analysis.lines_of_code > 500) complexity += 5;

    return Math.round(complexity);
  }

  generateRuleBasedSummary(file: FileInfo, analysis: any): string {
    const path = file.path;
    const lang = file.extension;

    if (path.includes("config") || path.endsWith(".json")) {
      return `Configuration file defining ${analysis.exports?.length || 0} settings and options`;
    }

    if (path.includes("types") || path.includes("interface")) {
      return `Type definitions providing ${analysis.exports?.length || 0} interfaces and type declarations`;
    }

    if (lang === ".tsx" && analysis.exports?.length > 0) {
      return `React component: ${analysis.exports[0]} with ${analysis.functions?.length || 0} methods and ${analysis.classes?.length || 0} classes`;
    }

    if (path.includes("api/") && (path.includes("route") || path.includes("handler"))) {
      const methods = this.extractApiMethods(analysis);
      return `API endpoint handling ${methods.length > 0 ? methods.join(", ") : "HTTP"} requests with ${analysis.functions?.length || 0} handlers`;
    }

    if (path.includes("service")) {
      return `Service layer providing ${analysis.functions?.length || 0} business operations and ${analysis.classes?.length || 0} service classes`;
    }

    if (path.includes("util") || path.includes("helper")) {
      return `Utility module with ${analysis.functions?.length || 0} helper functions and ${analysis.exports?.length || 0} exports`;
    }

    if (path.includes("model") || path.includes("schema") || path.includes("database")) {
      return `Data layer defining ${analysis.classes?.length || 0} models and ${analysis.functions?.length || 0} database operations`;
    }

    if (path.includes("middleware")) {
      return `Middleware module with ${analysis.functions?.length || 0} middleware functions for request processing`;
    }

    if (path.includes("test") || path.includes("spec")) {
      return `Test suite with ${analysis.functions?.length || 0} test cases for validation and quality assurance`;
    }

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

    return [...new Set(found)];
  }

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

    //
    if ((content.includes("SELECT") || content.includes("INSERT") || content.includes("UPDATE")) && (content.includes("${") || content.includes('" + ') || content.includes("' + "))) {
      issues.push({
        type: "security",
        severity: "high",
        description: "Potential SQL injection vulnerability - use parameterized queries",
        category: "sql-injection-risk",
      });
    }

    if (content.includes("for (") && content.includes("await ") && !content.includes("Promise.all")) {
      issues.push({
        type: "performance",
        severity: "medium",
        description: "Sequential async operations in loop - consider Promise.all for parallel execution",
        category: "async-performance",
      });
    }

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

    tags.add(analysis.language);

    if (path.includes("api/")) tags.add("api");
    if (path.includes("component")) tags.add("component");
    if (path.includes("service")) tags.add("service");
    if (path.includes("model")) tags.add("model");
    if (path.includes("util")) tags.add("utility");
    if (path.includes("middleware")) tags.add("middleware");
    if (path.includes("auth")) tags.add("authentication");
    if (path.includes("database") || path.includes("db")) tags.add("database");

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
