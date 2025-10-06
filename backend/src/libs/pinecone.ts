import { Pinecone } from "@pinecone-database/pinecone";
import { getString } from "./env";

const pinecone = new Pinecone({ apiKey: getString("PINECONE_API_KEY")! });

export default pinecone;
