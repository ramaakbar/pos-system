import { Skeleton } from "./skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

export const TableSkeleton = ({ col, row }: { col: number; row: number }) => {
  return (
    <div className="overflow-auto rounded-md border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-secondary">
          <TableRow>
            {[...Array(col)].map((data, i) => (
              <TableHead key={i}>Column</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(row)].map((data, i) => (
            <TableRow key={i}>
              {[...Array(col)].map((data, i) => (
                <TableCell key={i}>
                  <Skeleton className="h-4 w-[200px]" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
