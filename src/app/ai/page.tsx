import { availableModels } from "@/lib/models";
import Chat from "./chat";

export const revalidate = 3600; // revalidate every hour

export default function AiPage() {
  const models = availableModels();
  return <Chat models={models} />;
}
