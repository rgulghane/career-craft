"use client";

import { createContext, useContext, type ReactNode } from "react";

const AdminAccessContext = createContext({ readOnly: false, isFullAdmin: false });

export function AdminAccessProvider({
  readOnly,
  isFullAdmin,
  children,
}: {
  readOnly: boolean;
  isFullAdmin: boolean;
  children: ReactNode;
}) {
  return (
    <AdminAccessContext.Provider value={{ readOnly, isFullAdmin }}>
      {children}
    </AdminAccessContext.Provider>
  );
}

export function useAdminAccess() {
  return useContext(AdminAccessContext);
}
