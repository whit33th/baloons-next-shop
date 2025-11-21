import { Suspense } from "react";
import CatalogPage from "./ClientPage";

export default function page() {
  return (
    <Suspense>
      <CatalogPage />
    </Suspense>
  );
}
