"use client";

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

type Props = {
  totalPages: number;
  totalPagesToDisplay?: number;
  currentPage: number;
  className?: string;
};

export const PaginatedList = ({
  totalPages,
  totalPagesToDisplay = 5,
  currentPage,
  className,
}: Props) => {
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
          href={{ query: { page: pageNumber } }}
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
            href={{
              query: {
                page: currentPage !== 1 ? currentPage - 1 : "",
              },
            }}
            onClick={(e) => (currentPage === 1 ? e.preventDefault() : null)}
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
            href={{
              query: {
                page: currentPage !== totalPages ? currentPage + 1 : "",
              },
            }}
            onClick={(e) =>
              currentPage === totalPages ? e.preventDefault() : null
            }
            aria-disabled={currentPage === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
