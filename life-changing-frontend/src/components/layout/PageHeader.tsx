import { cn } from "@/components/ui/utils";

interface PageHeaderProps {
    title: string;
    description?: string | React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-6", className)}>
            <div className="space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    {title}
                </h1>
                {description && (
                    <p className="text-sm text-muted-foreground md:text-base">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}
