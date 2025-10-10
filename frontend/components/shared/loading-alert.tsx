import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert-secondary";
import { CheckCircle2Icon, LoaderCircle } from "lucide-react";
import { CircularBarsSpinnerLoader } from "../ui/loader";

function LoadingAlert({ title, description }: { title: string; description?: string }) {
  return (
    <div className="fixed top-[90%] left-[80%] h-fit inset-0 flex w-fit items-center justify-center z-50">
      <Alert>
        <LoaderCircle className="w-4 animate-spin" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </div>
  );
}

export default LoadingAlert;
