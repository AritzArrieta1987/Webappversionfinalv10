import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { FinancesPage } from "./pages/FinancesPage";
import { ArtistPortalPage } from "./pages/ArtistPortalPage";
import { PhysicalSalesPage } from "./pages/PhysicalSalesPage";
 
export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/finances",
    Component: FinancesPage,
  },
  {
    path: "/physical",
    Component: PhysicalSalesPage,
  },
  {
    path: "/artist/:artistId",
    Component: ArtistPortalPage,
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
]);