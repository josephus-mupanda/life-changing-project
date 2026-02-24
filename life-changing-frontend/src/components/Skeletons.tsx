import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export function PageSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2 pt-4 md:pt-8">
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-4 w-[350px]" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-[120px] rounded-xl" />
                <Skeleton className="h-[120px] rounded-xl" />
                <Skeleton className="h-[120px] rounded-xl" />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="h-[300px] rounded-xl" />
                <Skeleton className="h-[300px] rounded-xl" />
            </div>
        </div>
    );
}

export function TableSkeleton({ rowCount = 5 }: { rowCount?: number }) {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-[150px]" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-4 w-[80px] ml-auto" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rowCount }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-12 w-[120px]" /></TableCell>
                            <TableCell><Skeleton className="h-12 w-[200px]" /></TableCell>
                            <TableCell><Skeleton className="h-12 w-[100px]" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-[60px] ml-auto rounded-full" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export function CardSkeleton() {
    return (
        <Card>
            <CardHeader className="gap-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center">
                <Skeleton className="h-[150px] w-full rounded-lg" />
            </CardContent>
        </Card>
    );
}
