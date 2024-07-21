"use client";

import { useSearchParams } from "next/navigation";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

type RouteFunction = (
  params?: Record<string, string | number>,
  query?: Record<string, string | number>
) => string;

type Props = {
  totalPages: number;
  totalPagesToDisplay?: number;
  currentPage: number;
  className?: string;
  route: RouteFunction;
};

export const PaginatedList = ({
  totalPages,
  totalPagesToDisplay = 5,
  currentPage,
  className,
  route,
}: Props) => {
  const searchParams = useSearchParams();
  const existingQuery = Object.fromEntries(searchParams.entries());

  const showLeftEllipsis = currentPage - 1 > totalPagesToDisplay / 2;
  const showRightEllipsis =
    totalPages - currentPage + 1 > totalPagesToDisplay / 2;

  const getPageNumbers = () => {
    if (totalPages <= totalPagesToDisplay) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      const half = Math.floor(totalPagesToDisplay / 2);
      let start = currentPage - half;
      let end = currentPage + half;
      if (start < 1) {
        start = 1;
        end = totalPagesToDisplay;
      }
      if (end > totalPages) {
        start = totalPages - totalPagesToDisplay + 1;
        end = totalPages;
      }
      if (showLeftEllipsis) {
        start++;
      }
      if (showRightEllipsis) {
        end--;
      }
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
  };

  const renderPaginationItems = () => {
    const pageNumbers = getPageNumbers();
    return pageNumbers.map((pageNumber) => (
      <PaginationItem key={pageNumber}>
        <PaginationLink
          href={route(
            {},
            {
              ...existingQuery,
              page: pageNumber,
            }
          )}
          isActive={pageNumber === currentPage}
        >
          {pageNumber}
        </PaginationLink>
      </PaginationItem>
    ));
  };

  return (
    <Pagination className={cn(className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={
              currentPage !== 1
                ? route(
                    {},
                    {
                      ...existingQuery,
                      page: currentPage - 1,
                    }
                  )
                : ""
            }
            aria-disabled={currentPage === 1}
          />
        </PaginationItem>
        {showLeftEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {renderPaginationItems()}
        {showRightEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationNext
            href={
              currentPage !== totalPages
                ? route(
                    {},
                    {
                      ...existingQuery,
                      page: currentPage + 1,
                    }
                  )
                : ""
            }
            aria-disabled={currentPage === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
