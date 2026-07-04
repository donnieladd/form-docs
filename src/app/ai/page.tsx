import { availableModels } from "@/lib/models";
import Chat from "./chat";

export const dynamic = "force-dynamic";

export default function AiPage() {
  const models = availableModels();
  return <Chat models={models} />;
}
