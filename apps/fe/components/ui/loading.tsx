import { Activity } from "lucide-react";

interface LoadingProps {
    text?: string;
    size?: "sm" | "md" | "lg";
}

export const Loading = ({ text = "Loading...", size = "md" }: LoadingProps) => {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
    };

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <Activity className={`${sizeClasses[size]} text-green-500 animate-spin mb-4`} />
            <p className="text-gray-400 text-sm">{text}</p>
        </div>
    );
};
