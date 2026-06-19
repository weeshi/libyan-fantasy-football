import { useState } from 'react';

interface UsePaginationProps {
  totalItems: number;
  initialItemsPerPage?: number;
}

export function usePagination({
  totalItems,
  initialItemsPerPage = 10,
}: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const setCurrentPage_safe = (page: number) => {
    const maxPage = Math.ceil(totalItems / itemsPerPage);
    if (page >= 1 && page <= maxPage) {
      setCurrentPage(page);
    }
  };

  const setItemsPerPage_safe = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage: setCurrentPage_safe,
    setItemsPerPage: setItemsPerPage_safe,
  };
}
