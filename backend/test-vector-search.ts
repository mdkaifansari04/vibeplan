import { VectorService } from "../src/api/v1/services/vector.service";

async function testVectorSearch() {
  const vectorService = new VectorService();
  const namespace = "mdkaifansari04-qlio-main";
  const userPrompt = "how to improve the process scheduling feature?";
  const contextType = "improvement";

  console.log(`Testing vector search with query: "${userPrompt}"`);
  console.log(`Query type: ${contextType}`);
  console.log(`Namespace: ${namespace}`);
  console.log("---");

  try {
    const result = await vectorService.findRelevantContext(namespace, userPrompt, contextType);

    console.log(`Total files found: ${result.totalFilesFound}`);
    console.log(`Languages found: ${[...new Set(result.files.map((f) => f.language).filter(Boolean))]}`);
    console.log(
      `File types: ${[
        ...new Set(
          result.files.map((f) => {
            const ext = f.path.split(".").pop();
            return ext || "no-extension";
          })
        ),
      ]}`
    );

    console.log("\nTop relevant files:");
    result.files.slice(0, 10).forEach((file, index) => {
      console.log(`${index + 1}. ${file.path}`);
      console.log(`   Similarity: ${(file.similarity * 100).toFixed(1)}%`);
      console.log(`   Language: ${file.language || "unknown"}`);
      console.log(`   Content preview: ${file.content.slice(0, 100)}...`);
      console.log("");
    });

    if (result.files.length === 0) {
      console.log("❌ No relevant files found! This indicates an issue with:");
      console.log("- Vector embeddings not working properly");
      console.log("- No indexed data in the namespace");
      console.log("- Query expansion not matching indexed content");

      // Test with a broader query
      console.log("\nTrying broader search...");
      const broadResult = await vectorService.getAllFiles(namespace, 10);
      console.log(`Total files in namespace: ${broadResult.length}`);
      if (broadResult.length > 0) {
        console.log("Sample files in namespace:");
        broadResult.slice(0, 5).forEach((file) => {
          console.log(`- ${file.path} (${file.language})`);
        });
      }
    } else {
      console.log("✅ Search working! Found relevant files.");
    }
  } catch (error) {
    console.error("❌ Vector search failed:", error);
  }
}

testVectorSearch();
